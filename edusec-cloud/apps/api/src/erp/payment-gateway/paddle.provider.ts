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
 * CURRENCY — CONFIRMED BUG FIX (2026-09-12): the first live test of "Pay via
 * Paddle" failed with "Invalid request." from Paddle's API. Root cause,
 * confirmed against Paddle's own docs
 * (developer.paddle.com/concepts/sell/supported-currencies): Paddle
 * supports a fixed list of ~33 settlement currencies, and OMR (Omani
 * Rial) — this project's default invoice currency — is NOT one of them (no
 * GCC currency is). Every OMR invoice was therefore guaranteed to be
 * rejected by Paddle regardless of amount or request shape.
 *
 * Fix, per the user's explicit decision: OMR amounts are converted to USD
 * using Oman's OFFICIAL FIXED CURRENCY-BOARD PEG (not a floating market
 * rate) before being sent to Paddle — see convertForPaddle() below. Any
 * other currency is passed through unchanged (unconverted) since this
 * project has never used a currency other than OMR; if that ever changes
 * and Paddle rejects it, that will surface as a normal gateway error like
 * any other, exactly as before.
 */
@Injectable()
export class PaddleProvider implements PaymentGatewayProvider {
  readonly gateway = "PADDLE" as const;

  /**
   * Oman's currency board has pegged the Omani Rial to the US Dollar at
   * this exact rate since 1986 (Central Bank of Oman, cbo.gov.om — "The
   * Fixed Peg of the RO to the US Dollar"; confirmed 2026-09-12):
   *   1 OMR = 2.6008 USD (exact)   |   1 USD = 0.3845 OMR (approx.)
   * This is a hard government peg, not a market-fluctuating exchange
   * rate, so hardcoding it here is safe and does not need to track live
   * FX markets or be refreshed periodically.
   */
  private static readonly OMR_TO_USD_FIXED_PEG = 2.6008;

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

  /**
   * Paddle does not support OMR — convert to USD via Oman's official fixed
   * peg so the transaction is billed in a currency Paddle actually accepts.
   * Returns the smallest-unit integer amount (cents for USD), the
   * currency_code to send to Paddle, and a human-readable note showing the
   * original OMR amount (appended to the price description so the
   * customer/admin can see exactly how the USD figure was derived — never
   * a silent, unexplained currency switch).
   */
  private convertForPaddle(amount: number, currency: string): { unitAmount: number; currencyCode: string; note: string } {
    const upper = currency.toUpperCase();

    if (upper === "OMR") {
      const usd = amount * PaddleProvider.OMR_TO_USD_FIXED_PEG;
      return {
        unitAmount: Math.round(usd * 100), // USD has 2 decimal places
        currencyCode: "USD",
        note: ` (${amount.toFixed(3)} OMR @ fixed peg 1 OMR = ${PaddleProvider.OMR_TO_USD_FIXED_PEG} USD)`,
      };
    }

    // Unconverted pass-through for any other currency (none currently used
    // in this system). Assumes a 2-decimal smallest unit, same as before —
    // if a 0- or 3-decimal currency is ever introduced here, this will need
    // revisiting, but that is out of scope for the OMR bug being fixed now.
    return { unitAmount: Math.round(amount * 100), currencyCode: upper, note: "" };
  }

  async createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new Error("Paddle is not configured — set PADDLE_API_KEY.");
    }

    const { unitAmount, currencyCode, note } = this.convertForPaddle(ctx.amount, ctx.currency);
    const description = `${ctx.description}${note}`;

    const res = await fetch(`${this.apiBase}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        items: [
          {
            quantity: 1,
            price: {
              description,
              name: description,
              unit_price: {
                amount: String(unitAmount),
                currency_code: currencyCode,
              },
              product: {
                name: `bxbii — ${ctx.description}`,
                tax_category: "standard",
              },
            },
          },
        ],
        custom_data: { invoiceId: ctx.invoiceId, cartId: ctx.cartId, originalAmount: ctx.amount, originalCurrency: ctx.currency },
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
