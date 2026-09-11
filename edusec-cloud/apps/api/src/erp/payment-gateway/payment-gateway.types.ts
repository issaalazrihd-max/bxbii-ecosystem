/**
 * Provider-agnostic checkout abstraction (ERP Phase 2 — "PaymentGatewayService
 * abstraction with PayTabs and Thawani implementations" the user asked for).
 * InvoicesController/PaymentsWebhooksController only ever talk to
 * PaymentGatewayService, never to PaytabsProvider/ThawaniProvider directly,
 * so adding a third gateway later means adding one more provider class, not
 * touching the controllers.
 */

export interface CheckoutContext {
  invoiceId: string;
  /** Human-readable merchant reference sent to the gateway (PayTabs cart_id / Thawani client_reference_id) — the Invoice's invoiceNumber. */
  cartId: string;
  /** Major currency unit, e.g. 12.5 for 12.500 OMR — each provider converts to its own smallest unit internally. */
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  /** Server-to-server webhook URL — only used by providers that need one passed per-request (PayTabs); Thawani's webhook is configured in its own dashboard, not per-request. */
  callbackUrl: string;
  locale?: "en" | "ar";
}

export interface CheckoutSession {
  redirectUrl: string;
  /** PayTabs: tran_ref. Thawani: session_id. Stored on Payment.gatewaySessionId so a later webhook/status check can find the right row. */
  gatewaySessionId: string;
}

export interface PaymentVerification {
  succeeded: boolean;
  gatewayTxnRef?: string;
  raw: unknown;
}

export interface PaymentGatewayProvider {
  readonly gateway: "PAYTABS" | "THAWANI";
  /** True once this gateway's real API keys are present as env vars. */
  isConfigured(): boolean;
  createCheckoutSession(ctx: CheckoutContext): Promise<CheckoutSession>;
  /**
   * Authoritative status check — always calls the gateway's own API rather
   * than trusting a webhook body. Neither PayTabs nor Thawani sign their
   * webhook payloads (confirmed against both providers' own documentation),
   * so PaymentsWebhooksController never marks a Payment SUCCEEDED from the
   * webhook body alone; it always re-confirms here first.
   */
  verifySession(gatewaySessionId: string): Promise<PaymentVerification>;
}
