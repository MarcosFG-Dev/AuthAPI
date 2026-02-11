const RefreshSessionUseCase = require("../../src/application/use-cases/auth/RefreshSessionUseCase");
const createInMemoryDependencies = require("../helpers/inMemoryDependencies");

describe("RefreshSessionUseCase", () => {
  it("rotates refresh token and returns new access token", async () => {
    const deps = createInMemoryDependencies();
    const user = await deps.userRepository.create({
      email: "rotate@example.com",
      name: "Rotate",
      passwordHash: "hash",
    });
    const issued = deps.tokenService.generateRefreshToken({ userId: user.id });
    await deps.refreshTokenRepository.create({
      jti: issued.jti,
      familyId: issued.familyId,
      userId: user.id,
      tokenHash: deps.tokenService.hashToken(issued.token),
      expiresAt: issued.expiresAt,
      createdByIp: "127.0.0.1",
      userAgent: "jest",
    });

    const useCase = new RefreshSessionUseCase({
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      userRepository: deps.userRepository,
    });

    const result = await useCase.execute({
      refreshToken: issued.token,
      ipAddress: "127.0.0.1",
      userAgent: "jest",
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toEqual(issued.token);
  });
});
