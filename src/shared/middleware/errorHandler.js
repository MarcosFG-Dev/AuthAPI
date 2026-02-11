const AppError = require("../errors/AppError");
const logger = require("../logger");
const { errorResponse } = require("../http/response");

function errorHandler(err, req, res, next) {
  const isDatabaseUnavailableError =
    err?.name === "PrismaClientInitializationError" ||
    (typeof err?.message === "string" && err.message.includes("Can't reach database server"));

  if (isDatabaseUnavailableError) {
    err = new AppError("Database unavailable", {
      statusCode: 503,
      code: "DATABASE_UNAVAILABLE",
      details: {
        hint: "Start PostgreSQL and run Prisma migrations.",
      },
    });
  }

  const appError =
    err instanceof AppError
      ? err
      : new AppError("Internal server error", {
          statusCode: 500,
          code: "INTERNAL_SERVER_ERROR",
          isOperational: false,
        });

  logger.error(
    {
      err,
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      statusCode: appError.statusCode,
      code: appError.code,
    },
    appError.message
  );

  return res.status(appError.statusCode).json(
    errorResponse({
      message: appError.message,
      code: appError.code,
      details: appError.details,
    })
  );
}

module.exports = errorHandler;
