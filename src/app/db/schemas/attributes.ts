import { pgEnum, pgTable, smallint, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

export const displayTypeEnum = pgEnum("display_type", [
  "text",
  "color_swatch",
  "image_swatch",
]);

export const attributes = pgTable("attributes", {
  id: uuid("attribute_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).unique().notNull(),
  display_type: displayTypeEnum("display_type").notNull(),
  sort_order: smallint("sort_order").default(0).notNull(),
  ...timestamps,
});
