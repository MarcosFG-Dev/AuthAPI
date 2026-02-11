const { RateLimiterMemory } = require("rate-limiter-flexible");
const env = require("../../shared/config/env");
const AppError = require("../../shared/errors/AppError");

class BruteForceProtector {
  constructor() {
    this.limiter = new RateLimiterMemory({
      points: env.LOGIN_MAX_ATTEMPTS,
      duration: env.LOGIN_BLOCK_SECONDS,
      blockDuration: env.LOGIN_BLOCK_SECONDS,
    });
  }

  buildKey(email, ipAddress) {
    return `${email.toLowerCase()}:${ipAddress}`;
  }

  async ensureCanAttempt(email, ipAddress) {
    const key = this.buildKey(email, ipAddress);
    const state = await this.limiter.get(key);
    if (state && state.consumedPoints >= env.LOGIN_MAX_ATTEMPTS) {
      throw new AppError("Too many login attempts. Try again later.", {
        statusCode: 429,
        code: "LOGIN_ATTEMPTS_EXCEEDED",
      });
    }
  }

  async registerFailure(email, ipAddress) {
    const key = this.buildKey(email, ipAddress);
    await this.limiter.consume(key, 1);
  }

  async clear(email, ipAddress) {
    const key = this.buildKey(email, ipAddress);
    await this.limiter.delete(key);
  }
}

module.exports = BruteForceProtector;
