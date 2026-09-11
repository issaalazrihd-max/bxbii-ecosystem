import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { IsEnum } from "class-validator";
import { PaymentGateway } from "@edusec/db";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { PaymentGatewayService } from "./payment-gateway/payment-gateway.service";
import { InvoicePdfService } from "./invoice-pdf.service";
import { InvoiceEmailService } from "./invoice-email.service";

type OnlineGateway = Exclude<PaymentGateway, "MANUAL">;

class InitiateCheckoutDto {
  @IsEnum(PaymentGateway)
  gateway!: OnlineGateway;
}

/**
 * ERP Phase 2 — Invoices admin API. Branch access is enforced inside
 * InvoicesService (same pattern as BatchesController/Service), so this
 * controller only gates on the flat erp.invoices.view/manage permissions.
 */
@Controller("erp/invoices")
export class InvoicesController {
  constructor(
    private readonly invoices: InvoicesService,
    private readonly gateways: PaymentGatewayService,
    private readonly prisma: PrismaService,
    private readonly pdf: InvoicePdfService,
    private readonly email: InvoiceEmailService,
  ) {}

  @Get()
  @RequirePermissions("erp.invoices.view")
  list(
    @CurrentUser() user: AccessTokenPayload,
    @Query("branchId") branchId?: string,
    @Query("studentId") studentId?: string,
    @Query("status") status?: string,
  ) {
    return this.invoices.list(user, { branchId, studentId, status });
  }

  /** Lets the admin UI show which gateways are actually usable right now
   * instead of offering a "Pay with PayTabs" button that would just fail. */
  @Get("gateways")
  @RequirePermissions("erp.invoices.view")
  listGateways() {
    return this.gateways.availableGateways();
  }

  @Get(":invoiceId")
  @RequirePermissions("erp.invoices.view")
  get(@CurrentUser() user: AccessTokenPayload, @Param("invoiceId") invoiceId: string) {
    return this.invoices.get(user, invoiceId);
  }

  @Get(":invoiceId/balance")
  @RequirePermissions("erp.invoices.view")
  getBalance(@CurrentUser() user: AccessTokenPayload, @Param("invoiceId") invoiceId: string) {
    return this.invoices.getBalance(user, invoiceId);
  }

  /**
   * On-demand PDF download — the user's direct request: "I want to be able
   * to pull it as a PDF whenever I want." Always available regardless of
   * whether SMTP email is configured, since this never leaves the server.
   */
  @Get(":invoiceId/pdf")
  @RequirePermissions("erp.invoices.view")
  async downloadPdf(
    @CurrentUser() user: AccessTokenPayload,
    @Param("invoiceId") invoiceId: string,
    @Res() res: Response,
  ) {
    const invoice = await this.invoices.get(user, invoiceId);
    const buffer = await this.pdf.generate(invoice as any);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      "Content-Length": String(buffer.length),
    });
    res.send(buffer);
  }

  @Post()
  @RequirePermissions("erp.invoices.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateInvoiceDto) {
    return this.invoices.create(user, dto);
  }

  @Patch(":invoiceId")
  @RequirePermissions("erp.invoices.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("invoiceId") invoiceId: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoices.update(user, invoiceId, dto);
  }

  @Delete(":invoiceId")
  @RequirePermissions("erp.invoices.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("invoiceId") invoiceId: string) {
    return this.invoices.remove(user, invoiceId);
  }

  /**
   * Emails the invoice to its student as a payment notice with the PDF
   * attached (the user's direct request) and records sentAt. Fails with a
   * clear "not configured" message — never a fake success — when no SMTP
   * credentials have been set, the same pattern used for PayTabs/Thawani
   * below: the ERP still works via manual payment recording / on-demand PDF
   * download in the meantime.
   */
  @Post(":invoiceId/send-email")
  @RequirePermissions("erp.invoices.manage")
  async sendEmail(@CurrentUser() user: AccessTokenPayload, @Param("invoiceId") invoiceId: string) {
    if (!this.email.isConfigured()) {
      throw new BadRequestException(
        "Email is not configured yet — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM to enable sending invoices by email. The PDF can still be downloaded manually in the meantime.",
      );
    }
    const invoice = await this.invoices.get(user, invoiceId);
    const buffer = await this.pdf.generate(invoice as any);
    await this.email.sendInvoiceEmail(invoice as any, buffer);
    return this.invoices.markSent(user, invoiceId);
  }

  /**
   * Starts a real gateway checkout for this invoice and returns the URL to
   * send the payer to. Fails with a clear message — never a fake success —
   * if the requested gateway has no API keys configured yet; the ERP still
   * works via manual payment recording (POST /erp/payments) in the
   * meantime, which is why this endpoint is opt-in rather than the only
   * way to record a payment.
   */
  @Post(":invoiceId/checkout")
  @RequirePermissions("erp.invoices.manage")
  async initiateCheckout(
    @CurrentUser() user: AccessTokenPayload,
    @Param("invoiceId") invoiceId: string,
    @Body() dto: InitiateCheckoutDto,
  ) {
    const invoice = await this.invoices.get(user, invoiceId);

    const student = await this.prisma.student.findFirst({ where: { id: invoice.studentId } });
    if (!student) throw new NotFoundException("Student not found");

    if (!this.gateways.isConfigured(dto.gateway)) {
      throw new BadRequestException(
        `${dto.gateway} is not configured yet — its API keys have not been set. Record this payment manually instead, or add ${dto.gateway === "PAYTABS" ? "PAYTABS_PROFILE_ID/PAYTABS_SERVER_KEY" : "THAWANI_API_KEY/THAWANI_PUBLISHABLE_KEY"} once the merchant account is ready.`,
      );
    }

    const webAppUrl = process.env.WEB_APP_URL ?? "https://app.bxbii.com";
    const apiPublicUrl = process.env.API_PUBLIC_URL ?? "https://api.bxbii.com";

    const session = await this.gateways.createCheckoutSession(dto.gateway, {
      invoiceId: invoice.id,
      cartId: invoice.invoiceNumber,
      amount: Number(invoice.totalAmount),
      currency: invoice.currency,
      description: `Invoice ${invoice.invoiceNumber}`,
      customerName: `${student.firstName} ${student.lastName}`,
      customerEmail: student.email ?? undefined,
      successUrl: `${webAppUrl}/erp/invoices?paid=${invoice.id}`,
      cancelUrl: `${webAppUrl}/erp/invoices?cancelled=${invoice.id}`,
      callbackUrl: `${apiPublicUrl}/api/v1/erp/payments/webhooks/${dto.gateway.toLowerCase()}`,
      locale: "en",
    });

    await this.prisma.payment.create({
      data: {
        tenantId: user.tenantId,
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        gateway: dto.gateway,
        gatewaySessionId: session.gatewaySessionId,
        status: "PENDING",
      },
    });

    return { redirectUrl: session.redirectUrl };
  }
}
