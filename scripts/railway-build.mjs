import { readFileSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const colourDir = path.join(root, "artifacts/colour-explorer");
const apiDir = path.join(root, "artifacts/api-server");

function run(command, cwd) {
  execSync(command, { cwd, stdio: "inherit", env: process.env });
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

const viteBin = resolvePackageBin("vite", colourDir);

run(`node "${viteBin}" build --config vite.config.ts`, colourDir);
run("node ./build.mjs", apiDir);

const frontendDist = path.join(colourDir, "dist/public");
const apiPublic = path.join(apiDir, "dist/public");

await rm(apiPublic, { recursive: true, force: true });
await cp(frontendDist, apiPublic, { recursive: true });

console.log("Railway build: copied frontend assets to api-server/dist/public");
