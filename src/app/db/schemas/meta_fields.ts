import { varchar } from "drizzle-orm/pg-core";

export const meta_fields = {
  meta_title: varchar("meta_title", { length: 100 }),
  meta_description: varchar("meta_description", { length: 180 }),
  og_image_url: varchar("og_image_url", { length: 255 }),
};
