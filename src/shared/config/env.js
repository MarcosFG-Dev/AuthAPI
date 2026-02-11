const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().min(1).default("Enterprise Auth API"),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  JWT_ISSUER: z.string().min(1).default("enterprise-auth-api"),
  JWT_AUDIENCE: z.string().min(1).default("enterprise-auth-clients"),
  COOKIE_REFRESH_NAME: z.string().min(1).default("rtk"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_BLOCK_SECONDS: z.coerce.number().int().positive().default(900),
  LOG_LEVEL: z.enum(["silent", "fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${details.join("\n")}`);
}

const env = parsed.data;

module.exports = {
  ...env,
  isProd: env.NODE_ENV === "production",
  isStaging: env.NODE_ENV === "staging",
  isDev: env.NODE_ENV === "development",
  corsOrigins: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
};
