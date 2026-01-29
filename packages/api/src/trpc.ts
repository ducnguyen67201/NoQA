import type { Session } from "@noqa/db";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

/**
 * Context for tRPC procedures
 */
export interface Context {
  session: Session | null;
  internalSecret?: string;
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 * Ensures user is logged in
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Internal procedure - for worker/service-to-service calls
 * Requires INTERNAL_API_SECRET
 */
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export const internalProcedure = t.procedure.use(({ ctx, next }) => {
  if (!INTERNAL_API_SECRET) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal API not configured",
    });
  }
  if (ctx.internalSecret !== INTERNAL_API_SECRET) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid internal secret",
    });
  }
  return next({ ctx });
});
