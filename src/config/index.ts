import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Validate all required env vars at startup — fail fast with a clear message
// rather than a cryptic runtime error deep inside a service.
const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const config = {
  env: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  port: Number(process.env.PORT) || 5000,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  databaseUrl: process.env.DATABASE_URL as string,
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
    currency: process.env.STRIPE_CURRENCY || "usd",
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  rateLimit: {
    // Max requests per window per IP
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    // Stricter limits for auth endpoints
    authMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
  },
} as const;

export default config;
