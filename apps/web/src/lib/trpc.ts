"use client";

import type { AppRouter } from "@noqa/api";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();
