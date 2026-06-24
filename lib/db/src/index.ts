import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function createPoolConfig(): pg.PoolConfig {
  const connectionString = process.env.DATABASE_URL!;
  const useSsl =
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true") ||
    (/\.railway\.app|amazonaws\.com|supabase\.co/.test(connectionString) &&
      !connectionString.includes("railway.internal"));

  return {
    connectionString,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

export const pool = new Pool(createPoolConfig());
export const db = drizzle(pool, { schema });

/** Idempotent — covers missed Railway release-phase drizzle pushes. */
export async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_schemes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        clerk_user_id text NOT NULL,
        name text NOT NULL,
        colours jsonb NOT NULL,
        maps jsonb NOT NULL,
        saved_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  } finally {
    client.release();
  }
}

export * from "./schema";
