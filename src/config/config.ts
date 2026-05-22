import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanString = z
  .string()
  .toLowerCase()
  .transform((val) => val === "true" || val === "1")
  .default(false);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8080),

  MONGODB_URI: z.string().optional(),
  DB_NAME: z.string().default("carrier-integration"),

  CORS_ORIGINS: z.string().optional(),

  UPS_CLIENT_ID: z.string().default("mock-client-id"),
  UPS_SECRET: z.string().default("mock-secret"),

  UPS_ENABLED: booleanString,
  FEDEX_ENABLED: booleanString,
  USPS_ENABLED: booleanString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const env = parsed.data;

export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  db: {
    mongodbUri: env.MONGODB_URI,
    dbName: env.DB_NAME,
  },
  cors: {
    origins: env.CORS_ORIGINS
      ? env.CORS_ORIGINS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  },
  shipping: {
    ups: {
      clientId: env.UPS_CLIENT_ID,
      secret: env.UPS_SECRET,
      enabled: env.UPS_ENABLED,
    },
    fedex: {
      enabled: env.FEDEX_ENABLED,
    },
    usps: {
      enabled: env.USPS_ENABLED,
    },
  },
} as const;

export type Config = typeof config;
