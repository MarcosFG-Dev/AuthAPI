const AppError = require("../../../shared/errors/AppError");

class RefreshSessionUseCase {
  constructor({ tokenService, refreshTokenRepository, userRepository }) {
    this.tokenService = tokenService;
    this.refreshTokenRepository = refreshTokenRepository;
    this.userRepository = userRepository;
  }

  async execute({ refreshToken, ipAddress, userAgent }) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenRecord = await this.refreshTokenRepository.findByJti(payload.jti);

    if (!tokenRecord) {
      await this.refreshTokenRepository.revokeFamily(payload.familyId, payload.sub, "reuse_detected");
      throw new AppError("Token reuse detected. Session invalidated.", {
        statusCode: 401,
        code: "REFRESH_TOKEN_REUSE_DETECTED",
      });
    }

    if (tokenRecord.revokedAt) {
      await this.refreshTokenRepository.revokeFamily(tokenRecord.familyId, tokenRecord.userId, "reuse_detected");
      throw new AppError("Refresh token already revoked", {
        statusCode: 401,
        code: "REFRESH_TOKEN_REUSED",
      });
    }

    const incomingHash = this.tokenService.hashToken(refreshToken);
    if (incomingHash !== tokenRecord.tokenHash) {
      await this.refreshTokenRepository.revokeFamily(tokenRecord.familyId, tokenRecord.userId, "hash_mismatch");
      throw new AppError("Invalid refresh token", {
        statusCode: 401,
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
      await this.refreshTokenRepository.revokeByJti(tokenRecord.jti, "expired");
      throw new AppError("Refresh token expired", {
        statusCode: 401,
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new AppError("User not found", { statusCode: 401, code: "USER_NOT_FOUND" });
    }

    const newRefreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      familyId: tokenRecord.familyId,
    });

    await this.refreshTokenRepository.rotateToken({
      currentJti: tokenRecord.jti,
      replacement: {
        jti: newRefreshToken.jti,
        familyId: tokenRecord.familyId,
        userId: user.id,
        tokenHash: this.tokenService.hashToken(newRefreshToken.token),
        expiresAt: newRefreshToken.expiresAt,
        createdByIp: ipAddress,
        userAgent,
      },
      reason: "rotated",
    });

    const accessToken = this.tokenService.generateAccessToken({ userId: user.id });

    return {
      user: this.userRepository.toPublic(user),
      accessToken,
      refreshToken: newRefreshToken.token,
      accessTokenExpiresIn: this.tokenService.accessTtl,
    };
  }
}

module.exports = RefreshSessionUseCase;
