import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { WhatsAppService } from "./whatsapp.service";

@Controller()
export class WhatsAppController {
  constructor(private readonly whatsapp: WhatsAppService) {}

  @Get("cms/whatsapp/status")
  @RequirePermissions("cms.contact.view")
  status(@CurrentUser() _user: AccessTokenPayload) {
    return { configured: this.whatsapp.isConfigured() };
  }

  @Post("cms/whatsapp/send")
  @RequirePermissions("cms.contact.manage")
  send(@CurrentUser() _user: AccessTokenPayload, @Body() dto: SendWhatsAppMessageDto) {
    return this.whatsapp.sendText(dto.phone, dto.message);
  }

  /**
   * Lightweight webhook endpoint reserved for the Meta WhatsApp Cloud API.
   * The full inbound-message inbox can be added once the Meta app credentials
   * and webhook subscription are connected; this endpoint intentionally does
   * not expose any customer data publicly.
   */
  @Get("public/whatsapp/webhook")
  @Public()
  webhookVerify() {
    return { ok: true };
  }
}
