import { createRouter } from "../trpc.js";
import { internalRouter } from "./internal.js";
import { projectRouter } from "./project.js";

export const appRouter = createRouter({
  project: projectRouter,
  internal: internalRouter,
});

export type AppRouter = typeof appRouter;
