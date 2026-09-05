import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateStudentDto {
  @IsString()
  studentCode!: string;

  @IsString()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  /** Which branch admits this student — becomes both primary and current branch. */
  @IsString()
  branchId!: string;
}
