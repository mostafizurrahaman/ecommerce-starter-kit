import {
  boolean,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { meta_fields } from "./meta_fields";
import { timestamps } from "./timestamps";

export const brandStatusEnum = pgEnum("brand_status", [
  "draft",
  "active",
  "inactive",
  "archived",
]);

export const brands = pgTable(
  "brands",
  {
    id: uuid("brand_id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"),
    image_url: text("image_url"),
    image_alt_text: varchar({ length: 120 }),
    is_featured: boolean("is_featured").notNull().default(false),
    display_order: smallint("display_order").notNull().default(0),
    status: brandStatusEnum("status").default("draft").notNull(),
    ...meta_fields,
    ...timestamps,
  },
  (table) => [
    index("brand_status_index").on(table.status),
    index("brand_is_featured").on(table.is_featured),
  ],
);
