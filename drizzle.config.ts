import { defineConfig } from "drizzle-kit";

import { configs } from "./src/app/configs";

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/app/db/schemas",
  dbCredentials: {
    url: configs.databaseUrl,
  },
});
