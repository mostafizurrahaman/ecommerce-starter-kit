import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { brands } from "./brand";
import { meta_fields } from "./meta_fields";
import { timestamps } from "./timestamps";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "inactive",
  "archived",
]);

export const products = pgTable(
  "products",
  {
    id: uuid("product_id").defaultRandom().primaryKey(),

    created_by: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),

    //   core info:
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 280 }).unique().notNull(),
    short_description: varchar("short_description", { length: 500 }),
    description: text("description"),
    brand_id: uuid("brand_id").references(() => brands.id, {
      onDelete: "set null",
    }),

    // thumbnail images:
    thumbnail_url: text("thumbnail_url"),
    thumbnail_alt_text: varchar("thumbnail_alt_text", { length: 255 }),

    // pricing:
    price: numeric("base_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    original_price: numeric("compare_at_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    // Has  variants:
    has_variants: boolean("has_variants").default(false).notNull(),
    specifications: jsonb("specifications").$type<Record<string, string>>(),

    // Status And Counter:
    status: productStatusEnum("product_status").default("draft").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    avg_rating: numeric("avg_rating", { precision: 3, scale: 2 })
      .default("0.00")
      .notNull(),
    review_count: integer("review_count").default(0).notNull(),
    total_sold: integer("total_sold").default(0).notNull(),
    published_at: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),

    // ... seo fields:
    ...meta_fields,
    ...timestamps,
  },
  (table) => [
    index("product_created_by_index").on(table.created_by),
    index("product_status_index").on(table.status),
    index("product_is_featured_index").on(table.is_featured),
    index("product_price_index").on(table.price),
  ],
);
