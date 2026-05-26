import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command) {
  execSync(command, { cwd: root, stdio: "inherit", env: process.env });
}

run("pnpm --filter @workspace/colour-explorer run build");
run("pnpm --filter @workspace/api-server run build");

const frontendDist = path.join(root, "artifacts/colour-explorer/dist/public");
const apiPublic = path.join(root, "artifacts/api-server/dist/public");

await rm(apiPublic, { recursive: true, force: true });
await cp(frontendDist, apiPublic, { recursive: true });

console.log("Railway build: copied frontend assets to api-server/dist/public");
