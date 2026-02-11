const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const swaggerUi = require("swagger-ui-express");
const { v4: uuidv4 } = require("uuid");
const env = require("./shared/config/env");
const logger = require("./shared/logger");
const { successResponse } = require("./shared/http/response");
const errorHandler = require("./shared/middleware/errorHandler");
const notFoundHandler = require("./shared/middleware/notFoundHandler");
const openApiSpec = require("./interfaces/http/docs/openapi");
const buildContainer = require("./container");
const buildV1Router = require("./interfaces/http/routes/v1");
const {
  globalLimiter,
  corsMiddleware,
  helmetMiddleware,
  compressionMiddleware,
} = require("./interfaces/http/middlewares/security");

function buildApp(containerOverrides = {}) {
  const app = express();
  const container = buildContainer(containerOverrides);
  const publicDir = path.join(__dirname, "..", "public");

  async function isDatabaseReady() {
    try {
      await container.prisma.$queryRawUnsafe("SELECT 1");
      return true;
    } catch (_) {
      return false;
    }
  }

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existing = req.headers["x-request-id"];
        const reqId = existing || uuidv4();
        res.setHeader("x-request-id", reqId);
        return reqId;
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    })
  );

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compressionMiddleware);
  app.use(express.json({ limit: "20kb" }));
  app.use(cookieParser());
  app.use(globalLimiter);
  app.use(express.static(publicDir));

  app.get("/health", (_req, res) => {
    return res.status(200).json(
      successResponse({
        message: "API alive",
        data: { status: "up", timestamp: new Date().toISOString() },
      })
    );
  });

  app.get("/health/liveness", (_req, res) => {
    return res.status(200).json(
      successResponse({
        message: "API alive",
        data: { status: "up", timestamp: new Date().toISOString() },
      })
    );
  });

  app.get("/health/readiness", async (_req, res) => {
    const dbReady = await isDatabaseReady();
    if (!dbReady) {
      return res.status(503).json({
        success: false,
        error: {
          code: "NOT_READY",
          message: "Service not ready",
          details: {
            database: "down",
          },
        },
      });
    }

    return res.status(200).json(
      successResponse({
        message: "API ready",
        data: {
          status: "ready",
          database: "up",
          timestamp: new Date().toISOString(),
        },
      })
    );
  });

  app.get("/", (_req, res) => {
    return res.sendFile(path.join(publicDir, "index.html"));
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use(env.API_PREFIX, buildV1Router(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;
