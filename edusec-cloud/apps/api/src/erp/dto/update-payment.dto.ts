import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentStatus } from "@edusec/db";

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  gatewayTxnRef?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
