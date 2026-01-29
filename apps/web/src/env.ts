import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().url(),

    // Auth
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url().optional(),

    // Internal API
    INTERNAL_API_SECRET: z.string().min(1),

    // Node
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  /**
   * Client-side environment variables schema
   * Prefix with NEXT_PUBLIC_ to expose to client
   */
  client: {
    // Example: NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  /**
   * Runtime environment variables
   * Destructure from process.env
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    INTERNAL_API_SECRET: process.env.INTERNAL_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * Skip validation in certain environments
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   */
  emptyStringAsUndefined: true,
});
