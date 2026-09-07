import { IsBoolean, IsOptional, IsString, IsUrl } from "class-validator";

export class CreatePartnerDto {
  @IsString()
  name!: string;

  @IsString()
  logoUrl!: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
