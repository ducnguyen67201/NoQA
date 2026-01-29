import { type Context, appRouter, createCallerFactory } from "@noqa/api";

const createCaller = createCallerFactory(appRouter);

type Caller = ReturnType<typeof createCaller>;

let _caller: Caller | null = null;

/**
 * Get the internal tRPC caller for service-to-service calls
 * Uses INTERNAL_API_SECRET for authentication
 */
export function getInternalCaller(): Caller {
  if (!_caller) {
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (!internalSecret) {
      throw new Error("INTERNAL_API_SECRET is required for worker");
    }

    _caller = createCaller({
      session: null,
      internalSecret,
    } satisfies Context);
  }
  return _caller;
}
