import { IsArray, IsString } from "class-validator";

/** Body: all of the tenant's partner ids, in their new display order. */
export class ReorderPartnersDto {
  @IsArray()
  @IsString({ each: true })
  orderedPartnerIds!: string[];
}
