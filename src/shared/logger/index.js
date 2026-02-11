const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: env.APP_NAME,
    env: env.NODE_ENV,
  },
  transport: env.isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, singleLine: true, translateTime: "SYS:standard" },
      }
    : undefined,
});

module.exports = logger;
