import { IsBoolean, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { NavigationLinkType } from "@edusec/db";

export class CreateNavigationItemDto {
  @IsString()
  arLabel!: string;

  @IsString()
  enLabel!: string;

  @IsEnum(NavigationLinkType)
  linkType!: NavigationLinkType;

  @ValidateIf((o) => o.linkType === "PAGE")
  @IsString()
  targetPageId?: string;

  @ValidateIf((o) => o.linkType === "EXTERNAL_URL")
  @IsString()
  externalUrl?: string;

  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;

  @IsString()
  @IsOptional()
  parentId?: string;
}
