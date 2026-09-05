import { IsEnum, IsOptional, IsString } from "class-validator";
import { BranchType } from "@edusec/db";

export class CreateBranchDto {
  @IsString()
  branchCode!: string;

  @IsString()
  branchName!: string;

  @IsEnum(BranchType)
  @IsOptional()
  branchType?: BranchType;

  @IsString()
  @IsOptional()
  parentBranchId?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
