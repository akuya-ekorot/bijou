import { env } from "@/lib/env.mjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const sql = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(sql);
