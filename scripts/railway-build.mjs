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

// Call vite/esbuild directly so Docker builds don't re-run `pnpm install` (root preinstall).
const requireColour = createRequire(path.join(colourDir, "package.json"));
const viteBin = requireColour.resolve("vite/bin/vite.js");

run(`node "${viteBin}" build --config vite.config.ts`, colourDir);
run("node ./build.mjs", apiDir);

const frontendDist = path.join(colourDir, "dist/public");
const apiPublic = path.join(apiDir, "dist/public");

await rm(apiPublic, { recursive: true, force: true });
await cp(frontendDist, apiPublic, { recursive: true });

console.log("Railway build: copied frontend assets to api-server/dist/public");
