import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
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
