import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { productVariants } from "./product-variants";

const orderItems = pgTable(
  "order_items",
  {
    id: uuid("order_items").defaultRandom().primaryKey(),
    order_id: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),
    variant_id: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "set null",
      }),
    product_title: varchar("product_title", { length: 255 }).notNull(),
    variant_sku: varchar("variant_sku", { length: 100 }).notNull(),
    attribute_summary: jsonb("attribute_summary").notNull(),
    unit_price: numeric("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    quantity: integer("quantity").notNull(),
    line_total: numeric({
      precision: 12,
      scale: 2,
    }),
  },
  (table) => {
    return [
      index("order_item_order_idx").on(table.order_id),
      index("order_item_variant_idx").on(table.order_id),
    ];
  },
);
