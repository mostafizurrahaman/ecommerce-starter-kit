import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";
import { attributes } from "./attributes";

export const attribute_values = pgTable("attribute_values", {
  id: uuid("attribute_value_id").defaultRandom().primaryKey(),
  attribute_id: uuid("attribute_id").references(() => attributes.id, {
    onDelete: "cascade",
  }),
  value: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).unique().notNull(),
  color_hex: varchar("color_hex", { length: 20 }),
  image_url: text("image_url"),
  sort_order: smallint("sort_order").default(0).notNull(),
  ...timestamps,
});
