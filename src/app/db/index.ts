import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { configs } from "../configs";

const pool = new Pool({
  connectionString: configs.databaseUrl,
});

export const db = drizzle({
  client: pool,
  // relations:
});
