const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const booleanFromString = z
  .string()
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().min(1).default("Enterprise Auth API"),
  API_PREFIX: z.string().regex(/^\/[A-Za-z0-9/_-]*$/, "API_PREFIX must start with / and contain only URL-safe path characters").default("/api/v1"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  JWT_ISSUER: z.string().min(1).default("enterprise-auth-api"),
  JWT_AUDIENCE: z.string().min(1).default("enterprise-auth-clients"),
  COOKIE_REFRESH_NAME: z.string().min(1).default("rtk"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: booleanFromString,
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
const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const productionIssues = [];
if (env.NODE_ENV === "production") {
  if (!env.COOKIE_SECURE) productionIssues.push("COOKIE_SECURE must be true in production");
  if (env.COOKIE_SAME_SITE === "none" && !env.COOKIE_SECURE) {
    productionIssues.push("COOKIE_SAME_SITE=none requires COOKIE_SECURE=true");
  }
  if (corsOrigins.length === 0) productionIssues.push("CORS_ORIGINS must define at least one origin in production");
  if (corsOrigins.includes("*")) productionIssues.push("CORS_ORIGINS cannot contain * in production");
  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    productionIssues.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  }
}

if (productionIssues.length > 0) {
  throw new Error(`Unsafe production environment:\n${productionIssues.join("\n")}`);
}

module.exports = {
  ...env,
  isProd: env.NODE_ENV === "production",
  isStaging: env.NODE_ENV === "staging",
  isDev: env.NODE_ENV === "development",
  corsOrigins,
};
