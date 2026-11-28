import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  index,
} from "drizzle-orm/pg-core";
import { timestampWithZone } from "./timestamps";
import { TUserStatus } from "@/app/modules/User";

export const UserRoleEnum = pgEnum("user_role", [
  "admin",
  "super_admin",
  "user",
  "moderator",
]);

export const UserStatus = pgEnum("user_status", [
  "pending",
  "active",
  "blocked",
  "deactivated",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("user_id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    phone: varchar("phone", { length: 20 }).unique().notNull(),
    password_hash: text("password_hash").notNull(),
    profile_image: text("profile_image"),
    // roles:
    role: UserRoleEnum("role").default("user").notNull(),

    // status flag:
    status: UserStatus("status").default("pending").notNull(),
    is_otp_verified: boolean("is_otp_verified").default(false).notNull(),
    is_two_factor_enabled: boolean("is_two_factor_enabled")
      .default(false)
      .notNull(),

    // blocked reason
    blocked_reason: varchar("blocked_reason", { length: 255 }),
    deletion_reason: varchar("deletion_reason", { length: 255 }),

    // timestamps
    password_changed_at: timestamp("password_changed_at", {
      withTimezone: true,
      mode: "date",
    }),
    verified_at: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    blocked_at: timestamp("blocked_at", {
      withTimezone: true,
      mode: "date",
    }),
    last_login: timestamp("last_login", {
      withTimezone: true,
      mode: "date",
    }),
    last_activity: timestamp("last_activity", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestampWithZone,
  },
  (table) => {
    return [index("role").on(table.role), index("status").on(table.status)];
  },
);

export type TInsertUser = typeof users.$inferInsert;
export type TGetUser = typeof users.$inferSelect;
export type TUserRole = [typeof UserRoleEnum.enumValues][number];
export type TUserStatus = [typeof UserStatus.enumValues][number];
