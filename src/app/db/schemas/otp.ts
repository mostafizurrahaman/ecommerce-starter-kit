import {
  index,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const otpEnum = pgEnum("otp_type", ["signup", "reset-password"]);

export const otps = pgTable(
  "otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .unique()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    type: otpEnum("type").notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expires_at: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return [index("otp_user_index").on(table.user_id)];
  },
);
