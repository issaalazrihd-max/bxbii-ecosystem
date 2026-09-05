import { IsOptional, IsString } from "class-validator";

/** Global student search (Multi-Branch doc, Section 5.2). */
export class SearchStudentsDto {
  @IsString()
  @IsOptional()
  query?: string; // matches name, student code, mobile, or email

  @IsString()
  @IsOptional()
  branchId?: string; // narrow to one branch the caller can view
}
