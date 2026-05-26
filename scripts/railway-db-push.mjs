import { readFileSync } from "node:fs";
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

function resolvePackageBin(packageName, cwd) {
  const req = createRequire(path.join(cwd, "package.json"));
  const pkgJsonPath = req.resolve(`${packageName}/package.json`);
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const binField = pkg.bin;
  const binRel =
    typeof binField === "string"
      ? binField
      : (binField?.[packageName] ?? Object.values(binField ?? {})[0]);
  if (!binRel) {
    throw new Error(`No bin entry found for ${packageName}`);
  }
  return path.join(path.dirname(pkgJsonPath), binRel);
}

const drizzleBin = resolvePackageBin("drizzle-kit", dbDir);

execSync(`node "${drizzleBin}" push --config ./drizzle.config.ts`, {
  cwd: dbDir,
  stdio: "inherit",
  env: process.env,
});
