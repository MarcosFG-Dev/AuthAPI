const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const env = require("../../../shared/config/env");
const AppError = require("../../../shared/errors/AppError");

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError("Rate limit exceeded", {
        statusCode: 429,
        code: "RATE_LIMIT_EXCEEDED",
      })
    );
  },
});

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(15, Math.floor(env.RATE_LIMIT_MAX / 3)),
  standardHeaders: true,
  legacyHeaders: false,
});

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(
      new AppError("Origin not allowed by CORS", {
        statusCode: 403,
        code: "CORS_ORIGIN_FORBIDDEN",
      })
    );
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const compressionMiddleware = compression();

module.exports = {
  globalLimiter,
  authLimiter,
  corsMiddleware,
  helmetMiddleware,
  compressionMiddleware,
};
