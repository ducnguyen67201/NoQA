import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Shared environment schema for non-Next.js apps (worker, etc.)
 */
export const createSharedEnv = () =>
  createEnv({
    server: {
      // Database
      DATABASE_URL: z.string().url(),

      // Redis
      REDIS_URL: z.string().url(),

      // Internal API
      INTERNAL_API_SECRET: z.string().min(1),

      // Node
      NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    },

    runtimeEnv: process.env,

    skipValidation: !!process.env.SKIP_ENV_VALIDATION,

    emptyStringAsUndefined: true,
  });

// Re-export the schema types for use in other packages
export const envSchema = {
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  INTERNAL_API_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
};
