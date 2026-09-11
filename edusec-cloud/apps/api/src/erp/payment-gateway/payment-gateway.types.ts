/**
 * Provider-agnostic checkout abstraction (ERP Phase 2 — "PaymentGatewayService
 * abstraction with PayTabs and Thawani implementations" the user asked for).
 * InvoicesController/PaymentsWebhooksController only ever talk to
 * PaymentGatewayService, never to PaytabsProvider/ThawaniProvider/PaddleProvider
 * directly, so adding a gateway means adding one more provider class, not
 * touching the controllers.
 */

export interface CheckoutContext {
  invoiceId: string;
  /** Human-readable merchant reference sent to the gateway (PayTabs cart_id / Thawani client_reference_id / Paddle custom_data) — the Invoice's invoiceNumber. */
  cartId: string;
  /** Major currency unit, e.g. 12.5 for 12.500 OMR — each provider converts to its own smallest unit internally. */
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  /** Server-to-server webhook URL — only used by providers that need one passed per-request (PayTabs); Thawani's and Paddle's webhooks are configured in their own dashboards, not per-request. */
  callbackUrl: string;
  locale?: "en" | "ar";
}

export interface CheckoutSession {
  redirectUrl: string;
  /** PayTabs: tran_ref. Thawani: session_id. Paddle: transaction id (txn_...). Stored on Payment.gatewaySessionId so a later webhook/status check can find the right row. */
  gatewaySessionId: string;
}

export interface PaymentVerification {
  succeeded: boolean;
  gatewayTxnRef?: string;
  raw: unknown;
}

export interface PaymentGatewayProvider {
  readonly gateway: "PAYTABS" | "THAWANI" | "PADDLE";
  /** True once this gateway's real API keys are present as env vars. */
  isConfigured(): boolean;
  createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession>;
  /**
   * Authoritative status check — always calls the gateway's own API rather
   * than trusting a webhook body. Neither PayTabs nor Thawani signs its
   * webhook payloads (confirmed against both providers' own documentation),
   * so PaymentsWebhooksController never marks a Payment SUCCEEDED from a
   * webhook body alone; it always re-confirms here first. Paddle DOES sign
   * its webhooks (Paddle-Signature header), and that signature is checked
   * too — but this authoritative re-check still runs on top of it, so the
   * same "never trust the webhook body alone" guarantee holds for all three.
   */
  verifySession(gatewaySessionId: string): Promise<PaymentVerification>;
}
