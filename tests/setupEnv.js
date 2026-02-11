process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.PORT = process.env.PORT || "3001";
process.env.APP_NAME = process.env.APP_NAME || "Enterprise Auth API Test";
process.env.API_PREFIX = process.env.API_PREFIX || "/api/v1";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/enterprise_auth_test?schema=public";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "test_access_secret_with_minimum_32_characters";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test_refresh_secret_with_minimum_32_characters";
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
process.env.JWT_ISSUER = process.env.JWT_ISSUER || "enterprise-auth-api";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "enterprise-auth-clients";
process.env.COOKIE_REFRESH_NAME = process.env.COOKIE_REFRESH_NAME || "rtk";
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE || "false";
process.env.COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || "lax";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || "http://localhost:3000";
process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || "60000";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || "120";
process.env.LOGIN_MAX_ATTEMPTS = process.env.LOGIN_MAX_ATTEMPTS || "5";
process.env.LOGIN_BLOCK_SECONDS = process.env.LOGIN_BLOCK_SECONDS || "900";
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "silent";
