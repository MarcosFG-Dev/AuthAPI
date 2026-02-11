const RefreshTokenRepository = require("../../domain/repositories/RefreshTokenRepository");

class PrismaRefreshTokenRepository extends RefreshTokenRepository {
  constructor({ prisma }) {
    super();
    this.prisma = prisma;
  }

  async create({ jti, familyId, userId, tokenHash, expiresAt, createdByIp, userAgent }) {
    return this.prisma.refreshToken.create({
      data: {
        jti,
        familyId,
        userId,
        tokenHash,
        expiresAt,
        createdByIp,
        userAgent,
      },
    });
  }

  async findByJti(jti) {
    return this.prisma.refreshToken.findUnique({ where: { jti } });
  }

  async rotateToken({ currentJti, replacement, reason }) {
    return this.prisma.$transaction(async (tx) => {
      const currentToken = await tx.refreshToken.findUnique({ where: { jti: currentJti } });
      if (!currentToken || currentToken.revokedAt) {
        return null;
      }

      const newToken = await tx.refreshToken.create({
        data: {
          jti: replacement.jti,
          familyId: replacement.familyId,
          userId: replacement.userId,
          tokenHash: replacement.tokenHash,
          expiresAt: replacement.expiresAt,
          createdByIp: replacement.createdByIp,
          userAgent: replacement.userAgent,
        },
      });

      await tx.refreshToken.update({
        where: { jti: currentJti },
        data: {
          revokedAt: new Date(),
          revokedReason: reason || "rotated",
          replacedByJti: replacement.jti,
        },
      });

      return newToken;
    });
  }

  async revokeFamily(familyId, userId, reason = "family_revoked") {
    return this.prisma.refreshToken.updateMany({
      where: {
        familyId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async revokeByJti(jti, reason = "manual_revoke") {
    return this.prisma.refreshToken.updateMany({
      where: { jti, revokedAt: null },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }
}

module.exports = PrismaRefreshTokenRepository;
