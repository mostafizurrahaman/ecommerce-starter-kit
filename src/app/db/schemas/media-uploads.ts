import {
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";
import { timestamps } from "./timestamps";

export const mediaStatusEnum = pgEnum("media_status", ["pending", "attached"]);

export const mediaUploads = pgTable(
  "media_uploads",
  {
    id: uuid("media_id").defaultRandom().primaryKey(),
    uploaded_by: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),
    url: text("url").notNull(),
    public_id: varchar("public_id").notNull(),
    status: mediaStatusEnum("status").notNull().default("pending"),
    ...timestamps,
  },
  (table) => [
    index("media_status_created_at_idx").on(table.status, table.created_at),
    index("media_product_idx").on(table.product_id),
  ],
);
