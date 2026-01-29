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

// Environment helpers
export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Re-export zod for convenience
export { z } from "zod";
