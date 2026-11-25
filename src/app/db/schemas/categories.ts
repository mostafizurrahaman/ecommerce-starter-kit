import {
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { timestamps } from "./timestamps";

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
  "archived",
]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("category_id").defaultRandom().primaryKey(),

    // Self-referencing parent category
    parent_id: uuid("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "restrict" },
    ),

    title: varchar("title", { length: 255 }).notNull(),

    description: text("description"),

    slug: varchar("slug", { length: 255 }).unique().notNull(),

    image_url: text("image_url"),

    image_alt_text: varchar("image_alt_text", { length: 255 }),

    // Hierarchy level
    depth: smallint("depth").default(1).notNull(),

    status: categoryStatusEnum("status").default("active").notNull(),

    display_order: smallint("display_order").default(0).notNull(),

    // SEO fields
    meta_title: varchar("meta_title", { length: 100 }),

    meta_description: varchar("meta_description", { length: 180 }),

    og_image_url: text("og_image_url"),

    ...timestamps,
  },
  (table) => [
    index("category_parent_id_index").on(table.parent_id),
    index("category_status_index").on(table.status),
    index("category_display_order_index").on(table.display_order),
  ],
);