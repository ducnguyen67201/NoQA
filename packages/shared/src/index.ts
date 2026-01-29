// Constants
export const APP_NAME = "NoQa";

// Utility types
export type NonEmptyArray<T> = [T, ...T[]];

// Utility functions
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}

// Re-export zod for convenience
export { z } from "zod";

// Re-export env utilities
export { createSharedEnv, envSchema } from "./env.js";
