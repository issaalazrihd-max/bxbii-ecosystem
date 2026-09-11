import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

/**
 * ERP Phase 2 — Payments admin API. Covers manual payment recording
 * (cash/bank transfer) directly; online-gateway checkout is started from
 * InvoicesController's POST :invoiceId/checkout instead, and the resulting
 * gateway payment rows are updated by PaymentsWebhooksController, not here.
 * Branch access is enforced inside PaymentsService transitively through the
 * parent Invoice's branch.
 */
@Controller("erp/payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @RequirePermissions("erp.payments.view")
  list(@CurrentUser() user: AccessTokenPayload, @Query("invoiceId") invoiceId?: string) {
    return this.payments.list(user, { invoiceId });
  }

  @Post()
  @RequirePermissions("erp.payments.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreatePaymentDto) {
    return this.payments.create(user, dto);
  }

  @Patch(":paymentId")
  @RequirePermissions("erp.payments.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("paymentId") paymentId: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.payments.update(user, paymentId, dto);
  }

  @Delete(":paymentId")
  @RequirePermissions("erp.payments.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("paymentId") paymentId: string) {
    return this.payments.remove(user, paymentId);
  }
}
