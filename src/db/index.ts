import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Do not initialize a database connection while Next.js collects route modules at build time.
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required at runtime. Configure it in Vercel Environment Variables.");
  }
  return new Pool({ connectionString: databaseUrl });
}

let localPool: Pool | undefined;

function getPool(): Pool {
  if (globalForDb.__arenaNextJsPostgresqlPool) return globalForDb.__arenaNextJsPostgresqlPool;
  if (!localPool) {
    localPool = createPool();
    if (process.env.NODE_ENV !== "production") globalForDb.__arenaNextJsPostgresqlPool = localPool;
  }
  return localPool;
}

// Defer pool construction until a query runs, not when route modules are imported.
export const db = drizzle({ client: new Proxy({} as Pool, {
  get(_target, key) {
    const pool = getPool();
    const value = Reflect.get(pool, key, pool);
    return typeof value === "function" ? value.bind(pool) : value;
  },
}) });
