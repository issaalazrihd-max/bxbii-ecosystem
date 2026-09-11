import { Injectable } from "@nestjs/common";
import type { CheckoutContext, CheckoutSession, PaymentGatewayProvider, PaymentVerification } from "./payment-gateway.types";

/**
 * Thawani Pay integration — Oman-native, CBO-licensed, the gateway the user
 * suggested himself for Omani payments. Built against Thawani's documented
 * E-commerce API: POST {base}/checkout/session to start a session, GET
 * {base}/checkout/session/:id to check its payment_status. THAWANI_MODE
 * switches between Thawani's UAT (sandbox) and live domains — defaults to
 * "test" so a missing/misconfigured env var can never accidentally take a
 * real payment.
 *
 * NOT YET TESTED against a live Thawani account — there is no merchant
 * account to test against yet (Claude cannot create one on the user's
 * behalf). Built exactly to Thawani's documented request/response shape;
 * run one real UAT transaction once THAWANI_API_KEY/
 * THAWANI_PUBLISHABLE_KEY are set, before relying on this in production.
 */
@Injectable()
export class ThawaniProvider implements PaymentGatewayProvider {
  readonly gateway = "THAWANI" as const;

  private get apiKey(): string | undefined {
    return process.env.THAWANI_API_KEY;
  }

  private get publishableKey(): string | undefined {
    return process.env.THAWANI_PUBLISHABLE_KEY;
  }

  private get isProduction(): boolean {
    return (process.env.THAWANI_MODE || "test").toLowerCase() === "production";
  }

  /** checkout.thawani.om (live) vs uatcheckout.thawani.om (sandbox) — both the API base and the redirect/pay page live under the same host, just different subdomains per environment. */
  private get checkoutDomain(): string {
    return this.isProduction ? "https://checkout.thawani.om" : "https://uatcheckout.thawani.om";
  }

  private get apiBase(): string {
    return `${this.checkoutDomain}/api/v1`;
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.publishableKey;
  }

  async createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new Error("Thawani is not configured — set THAWANI_API_KEY and THAWANI_PUBLISHABLE_KEY.");
    }

    // Thawani amounts are in baisa, the smallest OMR unit (1 OMR = 1000 baisa).
    const unitAmount = Math.round(ctx.amount * 1000);

    const res = await fetch(`${this.apiBase}/checkout/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "thawani-api-key": this.apiKey! },
      body: JSON.stringify({
        client_reference_id: ctx.cartId,
        mode: "payment",
        products: [{ name: ctx.description, quantity: 1, unit_amount: unitAmount }],
        success_url: ctx.successUrl,
        cancel_url: ctx.cancelUrl,
        metadata: { invoiceId: ctx.invoiceId },
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    const sessionId = data?.data?.session_id;
    if (!res.ok || !data?.success || !sessionId) {
      throw new Error(data?.description || data?.message || `Thawani checkout/session failed (HTTP ${res.status})`);
    }

    return {
      redirectUrl: `${this.checkoutDomain}/pay/${sessionId}?key=${this.publishableKey}`,
      gatewaySessionId: sessionId,
    };
  }

  async verifySession(sessionId: string): Promise<PaymentVerification> {
    if (!this.isConfigured()) {
      throw new Error("Thawani is not configured.");
    }

    const res = await fetch(`${this.apiBase}/checkout/session/${sessionId}`, {
      headers: { "thawani-api-key": this.apiKey! },
    });

    const data: any = await res.json().catch(() => ({}));
    const status = data?.data?.payment_status;
    return { succeeded: status === "paid", gatewayTxnRef: sessionId, raw: data };
  }
}
