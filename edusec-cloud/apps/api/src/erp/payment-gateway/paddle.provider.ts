import { Injectable } from "@nestjs/common";
import type { CheckoutContext, CheckoutSession, PaymentGatewayProvider, PaymentVerification } from "./payment-gateway.types";

/**
 * Paddle Billing integration (the user created his own Paddle account —
 * Seller ID 421449 — and supplied a live PADDLE_API_KEY himself; no account
 * was created on his behalf). Built directly against Paddle Billing's
 * documented REST API: POST /transactions to create a transaction and get a
 * hosted checkout.url back, GET /transactions/:id to check its status.
 * PADDLE_MODE switches between Paddle's sandbox and live API hosts —
 * defaults to "sandbox" so a missing/misconfigured env var can never
 * accidentally use the live key against a real customer.
 *
 * Every invoice is billed as a non-catalog item (an inline product+price on
 * the transaction itself) since invoices are ad-hoc amounts, not fixed
 * catalog products/prices pre-created in the Paddle dashboard — mirroring
 * how ThawaniProvider builds an ad-hoc `products` entry per checkout rather
 * than referencing a pre-created price.
 *
 * IMPORTANT — currency: Paddle Billing only supports a fixed list of
 * settlement currencies, and it is not confirmed (Paddle's own docs could
 * not be reached during this build) whether OMR — this project's default
 * invoice currency — is on that list. No conversion is invented here: the
 * invoice's real currency is sent as-is, and if Paddle rejects it, that
 * rejection surfaces as a normal "checkout failed" error to the admin,
 * exactly like any other gateway error. Do not treat "Pay via Paddle" as
 * reliable for OMR invoices until one real transaction has actually been
 * created and its checkout page inspected.
 *
 * NOT YET TESTED against the real Paddle account — this was built directly
 * from Paddle's documented request/response shape but has not yet had a
 * live transaction run against it. Run one real transaction (and inspect
 * the resulting checkout page before sending it to any real student) once
 * PADDLE_API_KEY is set, before relying on this in production.
 */
@Injectable()
export class PaddleProvider implements PaymentGatewayProvider {
  readonly gateway = "PADDLE" as const;

  private get apiKey(): string | undefined {
    return process.env.PADDLE_API_KEY;
  }

  /** Secret for the notification destination configured in the Paddle dashboard (Developer tools > Notifications) — required to verify the Paddle-Signature header on incoming webhooks. */
  private get webhookSecret(): string | undefined {
    return process.env.PADDLE_WEBHOOK_SECRET;
  }

  private get isProduction(): boolean {
    return (process.env.PADDLE_MODE || "sandbox").toLowerCase() === "production";
  }

  private get apiBase(): string {
    return this.isProduction ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new Error("Paddle is not configured — set PADDLE_API_KEY.");
    }

    // Paddle amounts are strings in the currency's smallest unit (e.g. cents
    // for USD; baisa for OMR) — confirmed against Paddle's documented
    // transaction/price shape.
    const unitAmount = Math.round(ctx.amount * 100);

    const res = await fetch(`${this.apiBase}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        items: [
          {
            quantity: 1,
            price: {
              description: ctx.description,
              name: ctx.description,
              unit_price: {
                amount: String(unitAmount),
                currency_code: ctx.currency,
              },
              product: {
                name: `bxbii — ${ctx.description}`,
                tax_category: "standard",
              },
            },
          },
        ],
        custom_data: { invoiceId: ctx.invoiceId, cartId: ctx.cartId },
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    const txnId: string | undefined = data?.data?.id;
    const checkoutUrl: string | undefined = data?.data?.checkout?.url;

    if (!res.ok || !txnId || !checkoutUrl) {
      const message =
        data?.error?.detail || data?.error?.code || `Paddle POST /transactions failed (HTTP ${res.status})`;
      throw new Error(message);
    }

    return { redirectUrl: checkoutUrl, gatewaySessionId: txnId };
  }

  async verifySession(transactionId: string): Promise<PaymentVerification> {
    if (!this.isConfigured()) {
      throw new Error("Paddle is not configured.");
    }

    const res = await fetch(`${this.apiBase}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    const data: any = await res.json().catch(() => ({}));
    const status = data?.data?.status;
    // Paddle transaction lifecycle: draft -> ready -> billed -> paid ->
    // completed (or canceled / past_due). Treat both "paid" and "completed"
    // as success so a payment isn't missed during the brief window between
    // the two states.
    return { succeeded: status === "paid" || status === "completed", gatewayTxnRef: transactionId, raw: data };
  }
}
