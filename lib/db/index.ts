import { env } from "@/lib/env.mjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as collectionSchema from "./schema/collections";

const sql = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(sql, {
  logger: true,
  schema: {
    ...collectionSchema,
  },
});
