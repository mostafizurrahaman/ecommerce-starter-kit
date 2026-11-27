import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const banners = pgTable("banners", {
  id: uuid("banner_id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  image_url: text("image_url").notNull(),
  starts_at: timestamp("starts_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ends_at: timestamp("ends_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  is_active: boolean("is_active").notNull().default(true),
});
