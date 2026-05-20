import { z } from "zod";
import dotenv from "dotenv";
import { SHIPPING_PROVIDERS } from "../utils/constants";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8080),

  CORS_ORIGINS: z.string().optional(),

  SHIPPING_PROVIDERS: z
    .array(z.enum(Object.values(SHIPPING_PROVIDERS) as [string, ...string[]]))
    .default([SHIPPING_PROVIDERS.UPS]),
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
  cors: {
    origins: env.CORS_ORIGINS
      ? env.CORS_ORIGINS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  },
  shipping: {
    providers: env.SHIPPING_PROVIDERS,
  },
} as const;

export type Config = typeof config;
