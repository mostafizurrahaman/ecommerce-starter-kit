import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "inactive",
  "archived",
]);

export const productTypeEnum = pgEnum("product_type", ["physical", "digital"]);

const products = pgTable("products", {
  id: uuid("product_id").defaultRandom().primaryKey(),

  created_by: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),

  //   core info:
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 280 }).unique().notNull(),
  short_description: varchar("short_description", { length: 500 }),
  description: text("description"),
});
