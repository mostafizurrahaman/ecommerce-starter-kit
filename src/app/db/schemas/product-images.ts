import { eq } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { timestamps } from "./timestamps";

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("image_id").defaultRandom().primaryKey(),

    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    variant_id: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    image_url: text("image_url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    alt_text: varchar("alt_text", { length: 255 }),

    is_primary: boolean("is_primary").default(false).notNull(),
    display_order: smallint("display_order").default(0).notNull(),

    ...timestamps,
  },
  (table) => [
    index("product_images_product_id_index").on(table.product_id),
    index("product_images_variant_id_index").on(table.variant_id),
    uniqueIndex("product_images_one_primary_per_product_idx")
      .on(table.product_id)
      .where(eq(table.is_primary, true)),
  ],
);
