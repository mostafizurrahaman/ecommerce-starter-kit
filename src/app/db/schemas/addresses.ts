import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const addresses = pgTable("addresses", {
  id: uuid("address_id").defaultRandom().primaryKey(),

  user_id: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  phone_number: varchar("phone_number"),

  address_line_1: varchar("address_line_1", {
    length: 500,
  }).notNull(),

  address_line_2: varchar("address_line_2", { length: 500 }),

  postal_code: varchar("postal_code", { length: 4 }).notNull(),

  city: varchar("city", { length: 50 }).notNull(),

  state: varchar("state", { length: 50 }).notNull(),

  country: varchar("country", { length: 50 }).default("bangladesh").notNull(),
});
