import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  smallint,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { timestamps } from "./timestamps";
import { eq, sql } from "drizzle-orm";

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("variant_id").defaultRandom().primaryKey(),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    //   identifier:
    sku: varchar("sku", { length: 100 }).unique().notNull(),
    barcode: varchar("barcode", { length: 100 }),
    title: varchar("title", { length: 255 }),

    //   price:
    price: numeric("price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    original_price: numeric("original_price", {
      precision: 12,
      scale: 2,
    }),
    cost_price: numeric("cost_price", { precision: 12, scale: 2 }).notNull(),

    //   Inventory & courier weight:
    stock_quantity: integer("stock_quantity").default(0).notNull(),
    low_stock_threshold: integer("low_stock_threshold").default(5).notNull(),
    weight_grams: integer("weight_grams").default(0).notNull(),

    //  Control flags:
    is_default: boolean("is_default").default(false).notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    display_order: smallint("display_order").default(0).notNull(),

    ...timestamps,
  },
  (table) => [
    index("variant_product_id_index").on(table.product_id),
    index("variant_is_active_index").on(table.product_id),
    uniqueIndex("variant_one_default_per_product_idx")
      .on(table.product_id)
      .where(eq(table.is_default, true)),
    check("variant_stock_non_negative", sql`${table.stock_quantity} >= 0`),
    check("variant_wight_grams_non_negative", sql`${table.weight_grams} >= 0`),
  ],
);
