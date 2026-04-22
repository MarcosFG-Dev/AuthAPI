class LogoutAllSessionsUseCase {
  constructor({ refreshTokenRepository }) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ userId }) {
    await this.refreshTokenRepository.revokeAllActiveForUser(userId, "manual_logout_all");
    return { ok: true };
  }
}

module.exports = LogoutAllSessionsUseCase;
