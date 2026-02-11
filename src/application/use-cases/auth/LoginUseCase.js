const AppError = require("../../../shared/errors/AppError");

class LoginUseCase {
  constructor({
    userRepository,
    passwordHasher,
    tokenService,
    refreshTokenRepository,
    bruteForceProtector,
  }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.refreshTokenRepository = refreshTokenRepository;
    this.bruteForceProtector = bruteForceProtector;
  }

  async execute({ email, password, ipAddress, userAgent }) {
    await this.bruteForceProtector.ensureCanAttempt(email, ipAddress);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      await this.bruteForceProtector.registerFailure(email, ipAddress);
      throw new AppError("Invalid credentials", { statusCode: 401, code: "INVALID_CREDENTIALS" });
    }

    const isValidPassword = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await this.bruteForceProtector.registerFailure(email, ipAddress);
      throw new AppError("Invalid credentials", { statusCode: 401, code: "INVALID_CREDENTIALS" });
    }

    await this.bruteForceProtector.clear(email, ipAddress);

    const accessToken = this.tokenService.generateAccessToken({ userId: user.id });
    const refreshToken = this.tokenService.generateRefreshToken({ userId: user.id });

    await this.refreshTokenRepository.create({
      jti: refreshToken.jti,
      familyId: refreshToken.familyId,
      userId: user.id,
      tokenHash: this.tokenService.hashToken(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      createdByIp: ipAddress,
      userAgent,
    });

    return {
      user: this.userRepository.toPublic(user),
      accessToken,
      refreshToken: refreshToken.token,
      accessTokenExpiresIn: this.tokenService.accessTtl,
    };
  }
}

module.exports = LoginUseCase;
