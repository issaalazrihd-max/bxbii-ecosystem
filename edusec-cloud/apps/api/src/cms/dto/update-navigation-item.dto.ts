import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { NavigationLinkType } from "@edusec/db";

export class UpdateNavigationItemDto {
  @IsString()
  @IsOptional()
  arLabel?: string;

  @IsString()
  @IsOptional()
  enLabel?: string;

  @IsEnum(NavigationLinkType)
  @IsOptional()
  linkType?: NavigationLinkType;

  @IsString()
  @IsOptional()
  targetPageId?: string;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
