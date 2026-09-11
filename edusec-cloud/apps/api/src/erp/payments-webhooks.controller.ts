import { BadRequestException, Controller, Logger, Post, Req } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "crypto";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { PaymentGateway } from "@edusec/db";
import { Public } from "../auth/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentGatewayService } from "./payment-gateway/payment-gateway.service";
import { PaymentsService } from "./payments.service";

type OnlineGateway = Exclude<PaymentGateway, "MANUAL">;

/**
 * Gateway webhook receivers — PayTabs, Thawani and Paddle all call these
 * directly, with no JWT, so every handler here is @Public() to bypass the
 * globally registered JwtAuthGuard (see auth.module.ts: "Global guard order
 * matters: authenticate first, then check module permissions"). Public()
 * only skips authentication, not correctness: neither PayTabs nor Thawani
 * signs its webhook body (confirmed against both gateways' own docs), so
 * their posted payloads are NEVER trusted directly — every call re-queries
 * the gateway's own API via PaymentGatewayService.verifySession() for the
 * authoritative status before touching the Payment row. Paddle DOES sign
 * its webhooks (Paddle-Signature header, verified below), but the same
 * authoritative re-check still runs afterwards — belt and braces. A forged
 * or replayed POST to any of these URLs can at most trigger a redundant,
 * harmless re-verification.
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

  @Post("paddle")
  @Public()
  paddle(@Req() req: RawBodyRequest<Request>) {
    this.verifyPaddleSignature(req);
    return this.handle("PADDLE", req);
  }

  /**
   * Paddle-Signature header format: "ts=<unix_ts>;h1=<hex hmac>". Signed
   * payload is "<ts>:<raw body>" (the raw, un-parsed bytes — not
   * JSON.stringify(req.body), which can serialize differently than what
   * Paddle actually sent), HMAC-SHA256 with the notification destination's
   * secret (PADDLE_WEBHOOK_SECRET, from Paddle dashboard > Developer tools >
   * Notifications). Requires rawBody capture enabled in main.ts
   * (NestFactory.create(AppModule, { rawBody: true })) — additive, does not
   * change how req.body is parsed for any existing route.
   *
   * If PADDLE_WEBHOOK_SECRET isn't set yet, verification is skipped with a
   * warning rather than hard-failing every webhook — the authoritative
   * verifySession() re-check below still protects Payment rows either way.
   * Once the secret is set, an invalid/missing signature is rejected
   * outright.
   */
  private verifyPaddleSignature(req: RawBodyRequest<Request>) {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn("PADDLE_WEBHOOK_SECRET not set — skipping Paddle webhook signature verification");
      return;
    }

    const header = req.headers["paddle-signature"];
    const rawBody = req.rawBody;
    if (typeof header !== "string" || !rawBody) {
      throw new BadRequestException("Missing Paddle-Signature header or raw body");
    }

    const parts = Object.fromEntries(
      header.split(";").map((p) => {
        const [k, v] = p.split("=");
        return [k, v];
      }),
    );
    const ts = parts.ts;
    const h1 = parts.h1;
    if (!ts || !h1) {
      throw new BadRequestException("Malformed Paddle-Signature header");
    }

    const signedPayload = `${ts}:${rawBody.toString("utf8")}`;
    const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(h1);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new BadRequestException("Invalid Paddle webhook signature");
    }
  }

  private async handle(gateway: OnlineGateway, req: Request) {
    const body: any = req.body ?? {};
    // PayTabs posts tran_ref + cart_id and identifies the session via
    // tran_ref; Thawani posts data.session_id; Paddle posts
    // data.id (the transaction id we stored as gatewaySessionId).
    const gatewaySessionId: string | undefined =
      gateway === "PAYTABS"
        ? body?.tran_ref ?? body?.cart_id
        : gateway === "PADDLE"
          ? body?.data?.id
          : body?.data?.session_id ?? body?.session_id;

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
