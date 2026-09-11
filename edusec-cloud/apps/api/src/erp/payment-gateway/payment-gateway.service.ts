import { Injectable } from "@nestjs/common";
import { PaymentGateway } from "@edusec/db";
import { PaytabsProvider } from "./paytabs.provider";
import { ThawaniProvider } from "./thawani.provider";
import type { CheckoutContext, CheckoutSession, PaymentGatewayProvider, PaymentVerification } from "./payment-gateway.types";

type OnlineGateway = Exclude<PaymentGateway, "MANUAL">;

/**
 * Single entry point InvoicesController/PaymentsWebhooksController use for
 * every gateway — the "PaymentGatewayService abstraction with PayTabs and
 * Thawani implementations" the user asked for. MANUAL payments never reach
 * this service at all (PaymentsService writes them directly), since there
 * is no gateway call to make for a cash/bank-transfer receipt.
 */
@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly paytabs: PaytabsProvider,
    private readonly thawani: ThawaniProvider,
  ) {}

  private resolve(gateway: OnlineGateway): PaymentGatewayProvider {
    if (gateway === "PAYTABS") return this.paytabs;
    if (gateway === "THAWANI") return this.thawani;
    throw new Error(`Unsupported payment gateway: ${gateway}`);
  }

  isConfigured(gateway: OnlineGateway): boolean {
    return this.resolve(gateway).isConfigured();
  }

  /** Lets the admin UI show which gateways are actually usable right now, instead of offering a "Pay with PayTabs" button that would just fail. */
  availableGateways(): Array<{ gateway: OnlineGateway; configured: boolean }> {
    return [
      { gateway: "PAYTABS", configured: this.paytabs.isConfigured() },
      { gateway: "THAWANI", configured: this.thawani.isConfigured() },
    ];
  }

  createCheckoutSession(gateway: OnlineGateway, ctx: CheckoutContext): Promise<CheckoutSession> {
    return this.resolve(gateway).createCheckoutSession(ctx);
  }

  verifySession(gateway: OnlineGateway, gatewaySessionId: string): Promise<PaymentVerification> {
    return this.resolve(gateway).verifySession(gatewaySessionId);
  }
}
