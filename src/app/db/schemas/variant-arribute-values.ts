import { index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { attribute_values } from "./attribute_values";

import { timestamps } from "./timestamps";
import { productVariants } from "./product-variants";

export const variantAttributeValues = pgTable(
  "variant_attribute_values",
  {
    id: uuid("variant_attribute_value_id").defaultRandom().primaryKey(),

    variant_id: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    attribute_value_id: uuid("attribute_value_id")
      .notNull()
      .references(() => attribute_values.id, { onDelete: "restrict" }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("variant_attribute_value_unique_idx").on(
      table.variant_id,
      table.attribute_value_id,
    ),
    index("vav_attribute_value_id_idx").on(table.attribute_value_id),
  ],
);
