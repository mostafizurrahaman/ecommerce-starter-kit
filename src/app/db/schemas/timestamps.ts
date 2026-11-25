import { timestamp, varchar } from "drizzle-orm/pg-core";

export const timestamps = {
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
    .notNull()
    .$onUpdate(() => new Date()),
};

export const timestampWithZone = {
  ...timestamps,
  timezone: varchar("timezone", { length: 50 }).default("Asia/Dhaka").notNull(),
};
