const AppError = require("../../../shared/errors/AppError");

class RegisterUserUseCase {
  constructor({ userRepository, passwordHasher, tokenService, refreshTokenRepository }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ email, password, name, ipAddress, userAgent }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already in use", {
        statusCode: 409,
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.userRepository.create({
      email,
      name,
      passwordHash,
    });

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
      user,
      accessToken,
      refreshToken: refreshToken.token,
      accessTokenExpiresIn: this.tokenService.accessTtl,
    };
  }
}

module.exports = RegisterUserUseCase;
