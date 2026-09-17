import { IsEmail, IsString } from "class-validator";

/** Body accepted from the public /contact-us page's form — no auth, no status/id. */
export class CreateContactSubmissionDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  subject?: string;

  @IsString()
  message!: string;
}
