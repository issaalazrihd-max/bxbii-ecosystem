import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdatePartnerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsInt()
  @IsOptional()
  position?: number;
}
