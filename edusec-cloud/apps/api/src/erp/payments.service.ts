import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

const MODULE = "erp.payments";

/**
 * Payments (ERP Phase 2) — one attempt to settle an Invoice, either MANUAL
 * (cash/bank transfer recorded by staff — works today, before any real
 * gateway is configured) or through PAYTABS/THAWANI. Payment carries no
 * branch_id of its own; branch scoping is enforced transitively through
 * its Invoice's branch, the same pattern EnrollmentsService uses through
 * Batch.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly audit: AuditService,
  ) {}

  async list(user: AccessTokenPayload, filters: { invoiceId?: string }) {
    const branchFilter = await this.branchScope.buildBranchFilter(user, "view", MODULE);

    return this.prisma.payment.findMany({
      where: {
        tenantId: user.tenantId,
        invoiceId: filters.invoiceId,
        invoice: branchFilter ? { branchId: branchFilter } : undefined,
      },
      include: { invoice: { include: { student: true, branch: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Records a payment against an Invoice — the normal path for MANUAL
   * payments, and also used internally when a gateway checkout is first
   * initiated (status PENDING, filled in later by the webhook). When the
   * new payment is SUCCEEDED, rolls the Invoice's status forward — the one
   * place an Invoice's status changes automatically, mirroring
   * Enrollment's auto-waitlist logic from ERP Phase 1.
   */
  async create(user: AccessTokenPayload, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: dto.invoiceId, tenantId: user.tenantId } });
    if (!invoice) throw new NotFoundException("Invoice not found");
    await this.branchScope.assertCanAccessBranch(user, invoice.branchId, "edit", MODULE);

    const status = dto.status ?? "SUCCEEDED";
    const payment = await this.prisma.payment.create({
      data: {
        tenantId: user.tenantId,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        currency: dto.currency ?? invoice.currency,
        gateway: dto.gateway ?? "MANUAL",
        gatewayTxnRef: dto.gatewayTxnRef,
        status,
        paidAt: status === "SUCCEEDED" ? (dto.paidAt ? new Date(dto.paidAt) : new Date()) : undefined,
        notes: dto.notes,
      },
    });

    if (payment.status === "SUCCEEDED") {
      await this.rollUpInvoiceStatus(invoice.id);
    }

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.payment.create",
      entityType: "Payment",
      entityId: payment.id,
      after: payment,
    });

    return payment;
  }

  async update(user: AccessTokenPayload, paymentId: string, dto: UpdatePaymentDto) {
    const before = await this.getOrThrow(user.tenantId, paymentId);
    await this.branchScope.assertCanAccessBranch(user, before.invoice.branchId, "edit", MODULE);

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: dto.status,
        gatewayTxnRef: dto.gatewayTxnRef,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        notes: dto.notes,
      },
    });

    await this.rollUpInvoiceStatus(payment.invoiceId);

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.payment.update",
      entityType: "Payment",
      entityId: payment.id,
      before,
      after: payment,
    });

    return payment;
  }

  async remove(user: AccessTokenPayload, paymentId: string) {
    const payment = await this.getOrThrow(user.tenantId, paymentId);
    await this.branchScope.assertCanAccessBranch(user, payment.invoice.branchId, "edit", MODULE);

    await this.prisma.payment.delete({ where: { id: paymentId } });
    await this.rollUpInvoiceStatus(payment.invoiceId);

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.payment.delete",
      entityType: "Payment",
      entityId: paymentId,
      before: payment,
    });

    return { id: paymentId, deleted: true };
  }

  /**
   * Recomputes and saves an Invoice's status from the sum of its SUCCEEDED
   * payments. Invoice never stores "amount paid" directly (see the schema
   * comment on Invoice/Payment) — this is the only place that derived
   * status is written, called after every payment create/update/delete and
   * from the gateway webhook handler.
   */
  async rollUpInvoiceStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.status === "CANCELLED") return;

    const paid = await this.prisma.payment.aggregate({
      where: { invoiceId, status: "SUCCEEDED" },
      _sum: { amount: true },
    });
    const paidAmount = Number(paid._sum.amount ?? 0);
    const totalAmount = Number(invoice.totalAmount);

    let nextStatus = invoice.status;
    if (paidAmount <= 0) {
      nextStatus = invoice.status === "DRAFT" ? "DRAFT" : "SENT";
    } else if (paidAmount >= totalAmount) {
      nextStatus = "PAID";
    } else {
      nextStatus = "PARTIALLY_PAID";
    }

    if (nextStatus !== invoice.status) {
      await this.prisma.invoice.update({ where: { id: invoiceId }, data: { status: nextStatus } });
    }
  }

  /**
   * System-initiated update used only by PaymentsWebhooksController, after
   * it has independently re-verified the payment's status via
   * PaymentGatewayService.verifySession() (gateways call this endpoint with
   * no JWT and no signature, so there is no real "current user" to check
   * branch/permission scope against — the trust boundary here is the
   * server-to-server gateway API call, not a logged-in user). Never call
   * this from a controller reachable by an ordinary authenticated request.
   */
  async applyGatewayResult(
    paymentId: string,
    result: { status: "SUCCEEDED" | "FAILED"; gatewayTxnRef?: string },
  ) {
    const before = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!before) throw new NotFoundException("Payment not found");

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: result.status,
        gatewayTxnRef: result.gatewayTxnRef,
        paidAt: result.status === "SUCCEEDED" ? new Date() : before.paidAt,
      },
    });

    if (payment.status === "SUCCEEDED") {
      await this.rollUpInvoiceStatus(payment.invoiceId);
    }

    await this.audit.record({
      tenantId: payment.tenantId,
      action: "erp.payment.webhook_update",
      entityType: "Payment",
      entityId: payment.id,
      before,
      after: payment,
    });

    return payment;
  }

  private async getOrThrow(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    return payment;
  }
}
