import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

export const discountTypeEnum = pgEnum("discount_type", [
  "FIXED_AMOUNT",
  "PERCENTAGE",
]);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("coupon_id").defaultRandom().primaryKey(),

    code: varchar("code", { length: 50 }).notNull(),

    discount_type: discountTypeEnum("discount_type").notNull(),

    max_discount_amount: numeric("max_discount_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    min_order_amount: numeric("min_order_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    starts_at: timestamp("starts_at", {
      withTimezone: true,
      mode: "date",
    }),
    expires_at: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    usage_limit: integer("usage_limit").notNull().default(0),

    used_count: integer("used_count").notNull().default(0),

    per_user_limit: integer("per_user_limit").notNull().default(0),

    is_active: boolean("is_active").notNull().default(true),

    ...timestamps,
  },
  (table) => [
    index("coupons_code_idx").on(table.code),
    index("coupons_starts_at_expires_at").on(table.starts_at, table.expires_at),

    index("coupons_is_active").on(table.is_active),
  ],
);
