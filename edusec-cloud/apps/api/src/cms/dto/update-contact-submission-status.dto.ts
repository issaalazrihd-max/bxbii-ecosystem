import { IsEnum } from "class-validator";
import { ContactSubmissionStatus } from "@edusec/db";

/** Admin-only status transition (mark read / archive) — the message content itself is never editable. */
export class UpdateContactSubmissionStatusDto {
  @IsEnum(ContactSubmissionStatus)
  status!: ContactSubmissionStatus;
}
