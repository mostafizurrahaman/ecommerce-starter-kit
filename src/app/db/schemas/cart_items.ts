import { integer, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { productVariants } from "./product-variants";

export const cart_items = pgTable(
  "cart_items",
  {
    id: uuid("cart_item_id").defaultRandom().primaryKey(),
    cart_id: uuid("cart_id")
      .notNull()
      .references(() => carts.id, {
        onDelete: "cascade",
      }),
    variant_id: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "cascade",
      }),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    uniqueIndex("cart_variant_unique_index").on(
      table.cart_id,
      table.variant_id,
    ),
  ],
);
