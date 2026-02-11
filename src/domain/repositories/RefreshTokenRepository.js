class RefreshTokenRepository {
  async create() {
    throw new Error("Method not implemented");
  }

  async findByJti() {
    throw new Error("Method not implemented");
  }

  async rotateToken() {
    throw new Error("Method not implemented");
  }

  async revokeFamily() {
    throw new Error("Method not implemented");
  }

  async revokeByJti() {
    throw new Error("Method not implemented");
  }
}

module.exports = RefreshTokenRepository;
