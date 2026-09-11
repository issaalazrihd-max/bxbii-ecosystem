import { BadRequestException, Controller, Logger, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { PaymentGateway } from "@edusec/db";
import { Public } from "../auth/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentGatewayService } from "./payment-gateway/payment-gateway.service";
import { PaymentsService } from "./payments.service";

type OnlineGateway = Exclude<PaymentGateway, "MANUAL">;

/**
 * Gateway webhook receivers — PayTabs and Thawani call these directly, with
 * no JWT, so every handler here is @Public() to bypass the globally
 * registered JwtAuthGuard (see auth.module.ts: "Global guard order matters:
 * authenticate first, then check module permissions"). Public() only skips
 * authentication, not correctness: neither PayTabs nor Thawani signs its
 * webhook body (confirmed against both gateways' own docs), so the posted
 * payload is NEVER trusted directly — every call re-queries the gateway's
 * own API via PaymentGatewayService.verifySession() for the authoritative
 * status before touching the Payment row. A forged or replayed POST to
 * these URLs can at most trigger a redundant, harmless re-verification.
 */
@Controller("erp/payments/webhooks")
export class PaymentsWebhooksController {
  private readonly logger = new Logger(PaymentsWebhooksController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateways: PaymentGatewayService,
    private readonly payments: PaymentsService,
  ) {}

  @Post("paytabs")
  @Public()
  paytabs(@Req() req: Request) {
    return this.handle("PAYTABS", req);
  }

  @Post("thawani")
  @Public()
  thawani(@Req() req: Request) {
    return this.handle("THAWANI", req);
  }

  private async handle(gateway: OnlineGateway, req: Request) {
    const body: any = req.body ?? {};
    // PayTabs posts tran_ref + cart_id and identifies the session via
    // tran_ref; Thawani posts data.session_id. Either way we look the
    // Payment up by the gatewaySessionId we stored when checkout started,
    // never by trusting amount/status fields from the body itself.
    const gatewaySessionId: string | undefined =
      gateway === "PAYTABS" ? body?.tran_ref ?? body?.cart_id : body?.data?.session_id ?? body?.session_id;

    if (!gatewaySessionId) {
      this.logger.warn(`${gateway} webhook received with no session/tran reference — ignoring`);
      throw new BadRequestException("Missing gateway session reference");
    }

    const payment = await this.prisma.payment.findFirst({ where: { gateway, gatewaySessionId } });
    if (!payment) {
      this.logger.warn(`${gateway} webhook for unknown session ${gatewaySessionId} — ignoring`);
      // Respond 200 regardless — an unknown/stale session is not the
      // gateway's problem to retry, and returning an error here just
      // causes pointless webhook retry storms.
      return { received: true };
    }

    const verification = await this.gateways.verifySession(gateway, gatewaySessionId);

    await this.payments.applyGatewayResult(payment.id, {
      status: verification.succeeded ? "SUCCEEDED" : "FAILED",
      gatewayTxnRef: verification.gatewayTxnRef,
    });

    return { received: true };
  }
}
