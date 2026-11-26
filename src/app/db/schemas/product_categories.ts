import {
  boolean,
  index,
  pgTable,
  primaryKey,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { categories } from "./categories";
import { timestamps } from "./timestamps";
import { eq } from "drizzle-orm";

export const productCategories = pgTable(
  "product_categories",
  {
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    category_id: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "restrict",
      }),
    is_primary: boolean("is_primary").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    // primary key
    primaryKey({ columns: [table.product_id, table.category_id] }),
    // indexes:
    index("product_categories_category_id_index").on(table.category_id),

    // unique index:
    uniqueIndex("product_categories_one_primary_idx")
      .on(table.product_id)
      .where(eq(table.is_primary, true)),
  ],
);
