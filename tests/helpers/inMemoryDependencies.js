const { v4: uuidv4 } = require("uuid");
const JwtTokenService = require("../../src/infrastructure/security/JwtTokenService");
const PasswordHasher = require("../../src/infrastructure/security/PasswordHasher");
const BruteForceProtector = require("../../src/infrastructure/security/BruteForceProtector");

class InMemoryUserRepository {
  constructor() {
    this.users = [];
  }

  async create({ email, name, passwordHash }) {
    const user = {
      id: uuidv4(),
      email,
      name: name || null,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return this.toPublic(user);
  }

  async findByEmail(email) {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  toPublic(user) {
    if (!user) return null;
    const { passwordHash, ...publicData } = user;
    return publicData;
  }
}

class InMemoryRefreshTokenRepository {
  constructor() {
    this.tokens = [];
  }

  async create(record) {
    this.tokens.push({ ...record, revokedAt: null, revokedReason: null, replacedByJti: null });
    return record;
  }

  async findByJti(jti) {
    return this.tokens.find((token) => token.jti === jti) || null;
  }

  async rotateToken({ currentJti, replacement, reason }) {
    const current = this.tokens.find((token) => token.jti === currentJti);
    if (!current || current.revokedAt) return null;
    current.revokedAt = new Date();
    current.revokedReason = reason;
    current.replacedByJti = replacement.jti;
    this.tokens.push({ ...replacement, revokedAt: null, revokedReason: null, replacedByJti: null });
    return replacement;
  }

  async revokeFamily(familyId, userId, reason = "family_revoked") {
    this.tokens.forEach((token) => {
      if (token.familyId === familyId && token.userId === userId && !token.revokedAt) {
        token.revokedAt = new Date();
        token.revokedReason = reason;
      }
    });
  }

  async revokeByJti(jti, reason = "manual_revoke") {
    const token = this.tokens.find((item) => item.jti === jti);
    if (token && !token.revokedAt) {
      token.revokedAt = new Date();
      token.revokedReason = reason;
    }
  }
}

function createInMemoryDependencies() {
  return {
    tokenService: new JwtTokenService(),
    userRepository: new InMemoryUserRepository(),
    refreshTokenRepository: new InMemoryRefreshTokenRepository(),
    passwordHasher: new PasswordHasher(4),
    bruteForceProtector: new BruteForceProtector(),
  };
}

module.exports = createInMemoryDependencies;
