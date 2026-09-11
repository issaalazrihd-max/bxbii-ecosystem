import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { InvoiceStatus } from "@edusec/db";
import { LineItemDto } from "./line-item.dto";

export class CreateInvoiceDto {
  /** Which branch is issuing this invoice. */
  @IsString()
  branchId!: string;

  @IsString()
  studentId!: string;

  /** Optional link to the class/program this invoice bills for. */
  @IsString()
  @IsOptional()
  enrollmentId?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}
