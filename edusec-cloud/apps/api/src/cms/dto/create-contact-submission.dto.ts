import { IsEmail, IsOptional, IsString } from "class-validator";

/** Body accepted from the public /contact-us page's form — no auth, no status/id. */
export class CreateContactSubmissionDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  message!: string;
}
