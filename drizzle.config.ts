import { defineConfig } from "drizzle-kit";

import { configs } from "./src/app/configs";

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/app/db/schemas/index.ts",
  dbCredentials: {
    url: configs.databaseUrl,
  },
});
