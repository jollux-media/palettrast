import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(root, "lib/db");

if (!process.env.DATABASE_URL) {
  console.warn("railway-db-push: DATABASE_URL is not set — skipping schema push.");
  process.exit(0);
}

const requireDb = createRequire(path.join(dbDir, "package.json"));
const drizzleBin = requireDb.resolve("drizzle-kit/bin.cjs");

execSync(`node "${drizzleBin}" push --config ./drizzle.config.ts`, {
  cwd: dbDir,
  stdio: "inherit",
  env: process.env,
});
