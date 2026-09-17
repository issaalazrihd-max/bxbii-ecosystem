import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WhatsAppService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID") &&
      this.config.get<string>("WHATSAPP_ACCESS_TOKEN") &&
      this.config.get<string>("WHATSAPP_GRAPH_VERSION"),
    );
  }

  async sendText(phone: string, message: string) {
    const phoneNumberId = this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken = this.config.get<string>("WHATSAPP_ACCESS_TOKEN");
    const graphVersion = this.config.get<string>("WHATSAPP_GRAPH_VERSION");
    const graphBase = this.config.get<string>("WHATSAPP_GRAPH_BASE_URL") ?? "https://graph.facebook.com";

    if (!phoneNumberId || !accessToken || !graphVersion) {
      throw new ServiceUnavailableException("WhatsApp is not configured on the API");
    }

    const recipient = phone.replace(/\D/g, "");
    if (recipient.length < 8) throw new BadRequestException("Invalid WhatsApp phone number");

    const response = await fetch(`${graphBase}/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message ?? "WhatsApp message could not be sent";
      throw new BadRequestException(detail);
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id ?? null,
    };
  }
}
