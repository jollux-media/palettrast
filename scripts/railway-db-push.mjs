import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL) {
  console.warn("railway-db-push: DATABASE_URL is not set — skipping schema push.");
  process.exit(0);
}

execSync("pnpm --filter @workspace/db run push:ci", {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
