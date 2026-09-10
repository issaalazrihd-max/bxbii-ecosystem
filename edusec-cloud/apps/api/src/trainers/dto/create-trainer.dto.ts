import { IsEmail, IsInt, IsOptional, IsString } from "class-validator";

export class CreateTrainerDto {
  @IsString()
  trainerCode!: string;

  @IsString()
  fullName!: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsInt()
  @IsOptional()
  teachingHours?: number;

  /** Which branch this trainer is primarily based at. */
  @IsString()
  branchId!: string;
}
