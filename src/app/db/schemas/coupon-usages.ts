import {
  index,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { coupons } from "./coupons";
import { users } from "./users";

export const couponUsages = pgTable(
  "coupon_usages",
  {
    id: uuid("code_usages_id").defaultRandom().primaryKey(),
    coupon_id: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, {
        onDelete: "cascade",
      }),
    user_id: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    order_id: uuid("order_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    guest_phone: varchar("guest_phone", { length: 20 }),
    discount_amount: numeric("discount_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    used_at: timestamp("used_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    index("coupon_usages_coupon_id_idx").on(table.coupon_id),
    index("coupon_usages_user_id_idx").on(table.coupon_id),
    index("coupon_usages_guest_phone_idx").on(table.guest_phone),
    index("coupon_usages_order_id_idx").on(table.order_id),
  ],
);
