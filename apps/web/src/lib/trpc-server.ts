import "server-only";

import { type Context, appRouter, createCallerFactory } from "@noqa/api";

const createCaller = createCallerFactory(appRouter);

export function getServerCaller(ctx: Context) {
  return createCaller(ctx);
}

// For server components without auth
export function getPublicCaller() {
  return createCaller({ session: null });
}
