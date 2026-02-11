class LogoutUseCase {
  constructor({ tokenService, refreshTokenRepository }) {
    this.tokenService = tokenService;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      return { ok: true };
    }

    const payload = this.tokenService.decodeToken(refreshToken);
    if (payload?.jti) {
      await this.refreshTokenRepository.revokeByJti(payload.jti, "manual_logout");
    }

    return { ok: true };
  }
}

module.exports = LogoutUseCase;
