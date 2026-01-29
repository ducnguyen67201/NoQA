import { type Context, appRouter } from "@noqa/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (): Context => ({
      session: null, // TODO: Add auth session
    }),
  });

export { handler as GET, handler as POST };
