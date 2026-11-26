import {
  boolean,
  index,
  pgTable,
  smallint,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { attributes } from "./attributes";
import { timestamps } from "./timestamps";

export const categoryAttributes = pgTable(
  "category_attributes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    category_id: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),
    attribute_id: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, {
        onDelete: "cascade",
      }),

    is_required: boolean("is_required").default(false).notNull(),
    is_filterable: boolean("is_filterable").default(true).notNull(),
    display_order: smallint("display_order").default(0).notNull(),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("category_attribute_unique_idx").on(
      table.category_id,
      table.attribute_id,
    ),
    index("category_attribute_attr_id_idx").on(table.attribute_id),
  ],
);
