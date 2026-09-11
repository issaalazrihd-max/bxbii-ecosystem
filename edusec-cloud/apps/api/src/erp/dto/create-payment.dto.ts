import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PaymentGateway, PaymentStatus } from "@edusec/db";

/**
 * Records a payment attempt against an Invoice. Used directly for MANUAL
 * payments (staff records a cash/bank-transfer receipt); PAYTABS/THAWANI
 * payments are normally created internally by PaymentGatewayService when a
 * checkout session is initiated, then updated by the matching webhook —
 * but a finance officer can also record one manually here (e.g. to
 * reconcile a gateway payment the webhook missed).
 */
export class CreatePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentGateway)
  @IsOptional()
  gateway?: PaymentGateway;

  @IsString()
  @IsOptional()
  gatewayTxnRef?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
