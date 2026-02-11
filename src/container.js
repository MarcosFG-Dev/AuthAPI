const prisma = require("./infrastructure/db/prisma/client");
const PrismaUserRepository = require("./infrastructure/repositories/PrismaUserRepository");
const PrismaRefreshTokenRepository = require("./infrastructure/repositories/PrismaRefreshTokenRepository");
const PasswordHasher = require("./infrastructure/security/PasswordHasher");
const JwtTokenService = require("./infrastructure/security/JwtTokenService");
const BruteForceProtector = require("./infrastructure/security/BruteForceProtector");
const RegisterUserUseCase = require("./application/use-cases/auth/RegisterUserUseCase");
const LoginUseCase = require("./application/use-cases/auth/LoginUseCase");
const RefreshSessionUseCase = require("./application/use-cases/auth/RefreshSessionUseCase");
const LogoutUseCase = require("./application/use-cases/auth/LogoutUseCase");
const GetCurrentUserUseCase = require("./application/use-cases/auth/GetCurrentUserUseCase");
const AuthController = require("./interfaces/http/controllers/AuthController");

function buildContainer(overrides = {}) {
  const tokenService = overrides.tokenService || new JwtTokenService();
  const userRepository = overrides.userRepository || new PrismaUserRepository({ prisma });
  const refreshTokenRepository =
    overrides.refreshTokenRepository || new PrismaRefreshTokenRepository({ prisma });
  const passwordHasher = overrides.passwordHasher || new PasswordHasher();
  const bruteForceProtector = overrides.bruteForceProtector || new BruteForceProtector();

  const registerUserUseCase =
    overrides.registerUserUseCase ||
    new RegisterUserUseCase({
      userRepository,
      passwordHasher,
      tokenService,
      refreshTokenRepository,
    });

  const loginUseCase =
    overrides.loginUseCase ||
    new LoginUseCase({
      userRepository,
      passwordHasher,
      tokenService,
      refreshTokenRepository,
      bruteForceProtector,
    });

  const refreshSessionUseCase =
    overrides.refreshSessionUseCase ||
    new RefreshSessionUseCase({
      tokenService,
      refreshTokenRepository,
      userRepository,
    });

  const logoutUseCase =
    overrides.logoutUseCase ||
    new LogoutUseCase({
      tokenService,
      refreshTokenRepository,
    });

  const getCurrentUserUseCase =
    overrides.getCurrentUserUseCase ||
    new GetCurrentUserUseCase({
      userRepository,
    });

  const authController =
    overrides.authController ||
    new AuthController({
      registerUserUseCase,
      loginUseCase,
      refreshSessionUseCase,
      logoutUseCase,
      getCurrentUserUseCase,
    });

  return {
    prisma,
    tokenService,
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    bruteForceProtector,
    authController,
  };
}

module.exports = buildContainer;
