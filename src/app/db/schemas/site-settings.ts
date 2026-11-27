import { jsonb, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

export const SettingTypeEnum = pgEnum("setting_type", [
  "light_theme",
  "dark_theme",
  "site_meta",
  "social_links",
  "contact_info",
  "shipping_charge",
]);

export const siteSettings = pgTable("site_settings", {
  id: uuid("setting_id").defaultRandom().primaryKey(),
  key: SettingTypeEnum("key").unique().notNull(),
  value: jsonb("value"),
  ...timestamps,
});
