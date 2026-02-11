const LoginUseCase = require("../../src/application/use-cases/auth/LoginUseCase");
const RegisterUserUseCase = require("../../src/application/use-cases/auth/RegisterUserUseCase");
const RefreshSessionUseCase = require("../../src/application/use-cases/auth/RefreshSessionUseCase");
const LogoutUseCase = require("../../src/application/use-cases/auth/LogoutUseCase");
const GetCurrentUserUseCase = require("../../src/application/use-cases/auth/GetCurrentUserUseCase");
const createInMemoryDependencies = require("../helpers/inMemoryDependencies");

async function seedUser(deps, email = "seed@example.com", password = "StrongPass!2026") {
  const passwordHash = await deps.passwordHasher.hash(password);
  return deps.userRepository.create({
    email,
    name: "Seed",
    passwordHash,
  });
}

describe("Auth use cases - branch coverage", () => {
  it("register fails when email already exists", async () => {
    const deps = createInMemoryDependencies();
    await seedUser(deps, "dup@example.com");

    const useCase = new RegisterUserUseCase({
      userRepository: deps.userRepository,
      passwordHasher: deps.passwordHasher,
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
    });

    await expect(
      useCase.execute({
        email: "dup@example.com",
        password: "StrongPass!2026",
        name: "Dup",
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "EMAIL_ALREADY_EXISTS" });
  });

  it("login fails when user does not exist", async () => {
    const deps = createInMemoryDependencies();
    const useCase = new LoginUseCase({
      userRepository: deps.userRepository,
      passwordHasher: deps.passwordHasher,
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      bruteForceProtector: deps.bruteForceProtector,
    });

    await expect(
      useCase.execute({
        email: "nouser@example.com",
        password: "StrongPass!2026",
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("login fails with invalid password", async () => {
    const deps = createInMemoryDependencies();
    await seedUser(deps, "user@example.com", "StrongPass!2026");

    const useCase = new LoginUseCase({
      userRepository: deps.userRepository,
      passwordHasher: deps.passwordHasher,
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      bruteForceProtector: deps.bruteForceProtector,
    });

    await expect(
      useCase.execute({
        email: "user@example.com",
        password: "WrongPass!2026",
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("logout works with and without refresh token", async () => {
    const deps = createInMemoryDependencies();
    const user = await seedUser(deps);
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

    const useCase = new LogoutUseCase({
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
    });

    await expect(useCase.execute({ refreshToken: null })).resolves.toEqual({ ok: true });
    await expect(useCase.execute({ refreshToken: issued.token })).resolves.toEqual({ ok: true });
  });

  it("get current user fails when not found", async () => {
    const deps = createInMemoryDependencies();
    const useCase = new GetCurrentUserUseCase({ userRepository: deps.userRepository });
    await expect(useCase.execute({ userId: "not-found" })).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
    });
  });

  it("refresh rejects reused token (already revoked)", async () => {
    const deps = createInMemoryDependencies();
    const user = await seedUser(deps);
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
    const stored = await deps.refreshTokenRepository.findByJti(issued.jti);
    stored.revokedAt = new Date();

    const useCase = new RefreshSessionUseCase({
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      userRepository: deps.userRepository,
    });

    await expect(
      useCase.execute({
        refreshToken: issued.token,
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "REFRESH_TOKEN_REUSED" });
  });

  it("refresh rejects hash mismatch", async () => {
    const deps = createInMemoryDependencies();
    const user = await seedUser(deps);
    const issued = deps.tokenService.generateRefreshToken({ userId: user.id });
    await deps.refreshTokenRepository.create({
      jti: issued.jti,
      familyId: issued.familyId,
      userId: user.id,
      tokenHash: "wrong-hash",
      expiresAt: issued.expiresAt,
      createdByIp: "127.0.0.1",
      userAgent: "jest",
    });

    const useCase = new RefreshSessionUseCase({
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      userRepository: deps.userRepository,
    });

    await expect(
      useCase.execute({
        refreshToken: issued.token,
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
  });

  it("refresh rejects expired token and missing user", async () => {
    const deps = createInMemoryDependencies();
    const user = await seedUser(deps);

    const expired = deps.tokenService.generateRefreshToken({ userId: user.id });
    await deps.refreshTokenRepository.create({
      jti: expired.jti,
      familyId: expired.familyId,
      userId: user.id,
      tokenHash: deps.tokenService.hashToken(expired.token),
      expiresAt: new Date(Date.now() - 1000),
      createdByIp: "127.0.0.1",
      userAgent: "jest",
    });

    const useCase = new RefreshSessionUseCase({
      tokenService: deps.tokenService,
      refreshTokenRepository: deps.refreshTokenRepository,
      userRepository: deps.userRepository,
    });

    await expect(
      useCase.execute({
        refreshToken: expired.token,
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "REFRESH_TOKEN_EXPIRED" });

    const ghost = deps.tokenService.generateRefreshToken({ userId: "ghost-user" });
    await deps.refreshTokenRepository.create({
      jti: ghost.jti,
      familyId: ghost.familyId,
      userId: "ghost-user",
      tokenHash: deps.tokenService.hashToken(ghost.token),
      expiresAt: ghost.expiresAt,
      createdByIp: "127.0.0.1",
      userAgent: "jest",
    });

    await expect(
      useCase.execute({
        refreshToken: ghost.token,
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      })
    ).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
  });
});
