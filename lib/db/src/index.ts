import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy initialization — do not throw at module load time so Next.js build
// workers can import this module without DATABASE_URL being available.
let _pool: InstanceType<typeof Pool> | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getPool() {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

export const pool = new Proxy({} as InstanceType<typeof Pool>, {
  get(_target, prop) {
    return getPool()[prop as keyof InstanceType<typeof Pool>];
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});

export * from "./schema";
