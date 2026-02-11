const { PrismaClient } = require("@prisma/client");
const env = require("../../../shared/config/env");
const logger = require("../../../shared/logger");

const prisma = new PrismaClient({
  log: env.isDev ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

prisma.$on("error", (event) => {
  logger.error({ prisma: event }, "Prisma error event");
});

module.exports = prisma;
