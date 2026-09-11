import { IsNumber, IsString, Min } from "class-validator";

/**
 * One row of an Invoice's line_items JSON array. `amount` is intentionally
 * NOT accepted from the client — it is always computed server-side as
 * quantity * unitPrice in InvoicesService, so a client can never submit a
 * mismatched total (same reasoning as subtotal/totalAmount below).
 */
export class LineItemDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
