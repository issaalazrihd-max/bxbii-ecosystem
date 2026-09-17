import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { WhatsAppService } from "./whatsapp.service";

@Controller("cms/whatsapp")
export class WhatsAppController {
  constructor(private readonly whatsapp: WhatsAppService) {}

  @Get("status")
  @RequirePermissions("cms.contact.view")
  status(@CurrentUser() _user: AccessTokenPayload) {
    return { configured: this.whatsapp.isConfigured() };
  }

  @Post("send")
  @RequirePermissions("cms.contact.manage")
  send(@CurrentUser() _user: AccessTokenPayload, @Body() dto: SendWhatsAppMessageDto) {
    return this.whatsapp.sendText(dto.phone, dto.message);
  }
}
