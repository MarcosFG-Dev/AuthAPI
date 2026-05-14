const env = require("./shared/config/env");
const logger = require("./shared/logger");
const registerProcessHandlers = require("./shared/monitoring/processHandlers");
const buildApp = require("./app");
const prisma = require("./infrastructure/db/prisma/client");

registerProcessHandlers();

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
      docs: `http://localhost:${env.PORT}/docs`,
    },
    "Server started"
  );
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn({ signal }, "Graceful shutdown started");

  const forceExitTimer = setTimeout(() => {
    logger.error({ signal }, "Graceful shutdown timed out");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "HTTP server close failed");
    }

    try {
      await prisma.$disconnect();
      logger.info("HTTP server closed");
      process.exit(err ? 1 : 0);
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, "Database disconnect failed");
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
