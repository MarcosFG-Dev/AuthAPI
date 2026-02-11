const AppError = require("../../../shared/errors/AppError");

function authenticate({ tokenService }) {
  return (req, _res, next) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

    if (!token) {
      return next(
        new AppError("Missing access token", {
          statusCode: 401,
          code: "MISSING_ACCESS_TOKEN",
        })
      );
    }

    const payload = tokenService.verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      tokenPayload: payload,
    };
    return next();
  };
}

module.exports = authenticate;
