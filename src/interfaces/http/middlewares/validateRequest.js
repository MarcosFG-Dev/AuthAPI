const AppError = require("../../../shared/errors/AppError");

function validateRequest(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError("Validation failed", {
          statusCode: 422,
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        })
      );
    }

    req.validatedBody = parsed.data;
    return next();
  };
}

module.exports = validateRequest;
