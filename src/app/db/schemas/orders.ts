import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { coupons } from "./coupons";
import { timestamps } from "./timestamps";

// 1. Order Status:
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

// 2. Payment Status.
export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "bkash_manual",
  "nagad_manual",
  "rocket_manual",
  "bank_transfer",
]);

// 3. Payment Status.
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "pending_verification",
  "paid",
  "failed",
  "refunded",
]);

export const orders = pgTable("orders", {
  id: uuid("order_id").defaultRandom().primaryKey(),
  order_number: varchar("order_number").notNull(),
  user_id: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  coupon_id: uuid("coupon_idd").references(() => coupons.id, {
    onDelete: "set null",
  }),
  customer_name: varchar("customer_name", { length: 255 }),
  customer_email: varchar("customer_email", { length: 255 }),
  customer_phone: varchar("customer_phone", { length: 20 }),
  shipping_address: text("shipping_address").notNull(),
  subtotal: numeric("subtotal", {
    precision: 12,
    scale: 2,
  }).notNull(),
  discount_amount: numeric("discount_amount", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),
  delivery_charge: numeric("delivery_charge", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),
  total_amount: numeric("total_amount", {
    precision: 12,
    scale: 2,
  }),
  order_status: orderStatusEnum("order_status").default("pending").notNull(),
  payment_method: paymentMethodEnum("payment_method").notNull(),
  payment_status: paymentStatusEnum("payment_status")
    .default("unpaid")
    .notNull(),
  manual_trx_id: varchar("manual_trx_id", { length: 100 }),
  manual_sender_number: varchar("manual_sender_number", { length: 20 }),
  paid_at: timestamp("paid_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});
