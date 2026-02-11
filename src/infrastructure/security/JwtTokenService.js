const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const env = require("../../shared/config/env");
const AppError = require("../../shared/errors/AppError");

class JwtTokenService {
  constructor() {
    this.accessTtl = env.JWT_ACCESS_TTL;
    this.refreshTtl = env.JWT_REFRESH_TTL;
  }

  generateAccessToken({ userId }) {
    return jwt.sign({ sub: userId, type: "access" }, env.JWT_ACCESS_SECRET, {
      expiresIn: this.accessTtl,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
  }

  generateRefreshToken({ userId, familyId }) {
    const jti = uuidv4();
    const tokenFamilyId = familyId || uuidv4();
    const token = jwt.sign(
      { sub: userId, type: "refresh", jti, familyId: tokenFamilyId },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: this.refreshTtl,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }
    );

    const decoded = jwt.decode(token);
    return {
      token,
      jti,
      familyId: tokenFamilyId,
      expiresAt: new Date(decoded.exp * 1000),
    };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });
    } catch (err) {
      throw new AppError("Invalid access token", {
        statusCode: 401,
        code: err?.name === "TokenExpiredError" ? "ACCESS_TOKEN_EXPIRED" : "INVALID_ACCESS_TOKEN",
      });
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });
    } catch (err) {
      throw new AppError("Invalid refresh token", {
        statusCode: 401,
        code: err?.name === "TokenExpiredError" ? "REFRESH_TOKEN_EXPIRED" : "INVALID_REFRESH_TOKEN",
      });
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

module.exports = JwtTokenService;
