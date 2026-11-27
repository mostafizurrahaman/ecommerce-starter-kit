import { index, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { timestamps } from "./timestamps";

export const carts = pgTable(
  "carts",
  {
    id: uuid("cart_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    session_token: varchar("session_token", { length: 255 }),
    coupon_id: uuid("coupon_id"),
    discount_amount: numeric("discount_amount").notNull().default("0"),
    ...timestamps,
  },
  (table) => [
    index("cart_user_idx").on(table.user_id),
    index("cart_session_token_idx").on(table.session_token),
  ],
);
