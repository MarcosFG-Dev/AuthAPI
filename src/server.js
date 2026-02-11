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

async function shutdown(signal) {
  logger.warn({ signal }, "Graceful shutdown started");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
