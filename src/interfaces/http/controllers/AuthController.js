const env = require("../../../shared/config/env");
const { successResponse } = require("../../../shared/http/response");

class AuthController {
  constructor({ registerUserUseCase, loginUseCase, refreshSessionUseCase, logoutUseCase, getCurrentUserUseCase }) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUseCase = loginUseCase;
    this.refreshSessionUseCase = refreshSessionUseCase;
    this.logoutUseCase = logoutUseCase;
    this.getCurrentUserUseCase = getCurrentUserUseCase;
  }

  setRefreshCookie(res, refreshToken) {
    res.cookie(env.COOKIE_REFRESH_NAME, refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN || undefined,
      path: `${env.API_PREFIX}/auth/refresh`,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearRefreshCookie(res) {
    res.clearCookie(env.COOKIE_REFRESH_NAME, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN || undefined,
      path: `${env.API_PREFIX}/auth/refresh`,
    });
  }

  register = async (req, res, next) => {
    try {
      const result = await this.registerUserUseCase.execute({
        ...req.validatedBody,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      this.setRefreshCookie(res, result.refreshToken);
      return res.status(201).json(
        successResponse({
          message: "User registered successfully",
          data: {
            user: result.user,
            accessToken: result.accessToken,
            accessTokenExpiresIn: result.accessTokenExpiresIn,
          },
        })
      );
    } catch (err) {
      return next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.loginUseCase.execute({
        ...req.validatedBody,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      this.setRefreshCookie(res, result.refreshToken);
      return res.status(200).json(
        successResponse({
          message: "User authenticated successfully",
          data: {
            user: result.user,
            accessToken: result.accessToken,
            accessTokenExpiresIn: result.accessTokenExpiresIn,
          },
        })
      );
    } catch (err) {
      return next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.[env.COOKIE_REFRESH_NAME];
      const result = await this.refreshSessionUseCase.execute({
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
      });

      this.setRefreshCookie(res, result.refreshToken);
      return res.status(200).json(
        successResponse({
          message: "Session refreshed successfully",
          data: {
            user: result.user,
            accessToken: result.accessToken,
            accessTokenExpiresIn: result.accessTokenExpiresIn,
          },
        })
      );
    } catch (err) {
      return next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.[env.COOKIE_REFRESH_NAME];
      await this.logoutUseCase.execute({ refreshToken });
      this.clearRefreshCookie(res);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.getCurrentUserUseCase.execute({ userId: req.auth.userId });
      return res.status(200).json(
        successResponse({
          message: "Current user loaded",
          data: { user },
        })
      );
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = AuthController;
