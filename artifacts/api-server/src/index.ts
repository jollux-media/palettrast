import app from "./app";
import { ensureSchema } from "@workspace/db";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const host = process.env.HOST ?? "0.0.0.0";

async function start() {
  try {
    await ensureSchema();
    logger.info("Database schema ready");
  } catch (err) {
    logger.error({ err }, "Database schema setup failed");
    process.exit(1);
  }

  app.listen(port, host, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port, host }, "Server listening");
  });
}

void start();
