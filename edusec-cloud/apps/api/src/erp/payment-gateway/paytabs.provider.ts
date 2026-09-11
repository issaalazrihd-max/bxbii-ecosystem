import { Injectable } from "@nestjs/common";
import type { CheckoutContext, CheckoutSession, PaymentGatewayProvider, PaymentVerification } from "./payment-gateway.types";

/** PayTabs' per-region merchant domains — confirmed against PayTabs' own
 * official Node.js package (paytabscom/paytabs-nodejs-package), which maps
 * region codes to these exact hosts. OMN (Oman) has its own dedicated
 * domain, which is why this project defaults PAYTABS_REGION to OMN. */
const REGION_URLS: Record<string, string> = {
  ARE: "https://secure.paytabs.com/",
  SAU: "https://secure.paytabs.sa/",
  OMN: "https://secure-oman.paytabs.com/",
  JOR: "https://secure-jordan.paytabs.com/",
  EGY: "https://secure-egypt.paytabs.com/",
  KWT: "https://secure-kuwait.paytabs.com/",
  MAR: "https://secure-morocco.paytabs.com/",
  IRQ: "https://secure-iraq.paytabs.com/",
  QAT: "https://secure-doha.paytabs.com/",
  GLOBAL: "https://secure-global.paytabs.com/",
};

/**
 * PayTabs PT2 integration, built directly against PayTabs' documented REST
 * endpoints (POST /payment/request to start a hosted checkout, POST
 * /payment/query to check a transaction's status) — no extra npm package
 * to install, since Node's built-in fetch covers both calls.
 *
 * NOT YET TESTED against a live PayTabs account — there is no merchant
 * account to test against yet (Claude cannot create one on the user's
 * behalf). Built exactly to PayTabs' documented request/response shape;
 * run one real sandbox transaction once PAYTABS_PROFILE_ID/
 * PAYTABS_SERVER_KEY are set, before relying on this in production.
 */
@Injectable()
export class PaytabsProvider implements PaymentGatewayProvider {
  readonly gateway = "PAYTABS" as const;

  private get profileId(): string | undefined {
    return process.env.PAYTABS_PROFILE_ID;
  }

  private get serverKey(): string | undefined {
    return process.env.PAYTABS_SERVER_KEY;
  }

  private get baseUrl(): string {
    const region = (process.env.PAYTABS_REGION || "OMN").toUpperCase();
    return REGION_URLS[region] ?? REGION_URLS.OMN;
  }

  isConfigured(): boolean {
    return !!this.profileId && !!this.serverKey;
  }

  async createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new Error("PayTabs is not configured — set PAYTABS_PROFILE_ID and PAYTABS_SERVER_KEY.");
    }

    const res = await fetch(`${this.baseUrl}payment/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: this.serverKey! },
      body: JSON.stringify({
        profile_id: Number(this.profileId),
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: ctx.cartId,
        cart_currency: ctx.currency,
        cart_amount: ctx.amount,
        cart_description: ctx.description,
        paypage_lang: ctx.locale === "ar" ? "ar" : "en",
        customer_details: {
          name: ctx.customerName,
          email: ctx.customerEmail || "no-reply@bxbii.com",
          street1: "N/A",
          city: "Muscat",
          state: "Muscat",
          country: "OM",
          zip: "100",
          phone: "00000000",
          ip: "127.0.0.1",
        },
        callback: ctx.callbackUrl,
        return: ctx.successUrl,
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.redirect_url) {
      throw new Error(data.message || data.result || `PayTabs payment/request failed (HTTP ${res.status})`);
    }

    return { redirectUrl: data.redirect_url, gatewaySessionId: data.tran_ref };
  }

  async verifySession(tranRef: string): Promise<PaymentVerification> {
    if (!this.isConfigured()) {
      throw new Error("PayTabs is not configured.");
    }

    const res = await fetch(`${this.baseUrl}payment/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: this.serverKey! },
      body: JSON.stringify({ profile_id: Number(this.profileId), tran_ref: tranRef }),
    });

    const data: any = await res.json().catch(() => ({}));
    // response_status "A" = Authorised (PayTabs' own docs example shows
    // response_message "Authorised" for a successful transaction).
    const status = data?.payment_result?.response_status;
    return { succeeded: status === "A", gatewayTxnRef: tranRef, raw: data };
  }
}
