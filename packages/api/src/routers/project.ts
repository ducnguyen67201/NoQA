import { prisma } from "@noqa/db";
import { z } from "zod";
import { CreateProjectSchema, UpdateProjectSchema } from "../schemas/index.js";
import { createRouter, protectedProcedure, publicProcedure } from "../trpc.js";

export const projectRouter = createRouter({
  list: publicProcedure.query(async () => {
    return prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return prisma.project.findUnique({
      where: { id: input.id },
      include: {
        apiKeys: {
          where: { revokedAt: null },
          select: { id: true, name: true, createdAt: true, expiresAt: true },
        },
      },
    });
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return prisma.project.findUnique({
      where: { slug: input.slug },
    });
  }),

  create: protectedProcedure.input(CreateProjectSchema).mutation(async ({ input }) => {
    return prisma.project.create({
      data: input,
    });
  }),

  update: protectedProcedure.input(UpdateProjectSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return prisma.project.update({
      where: { id },
      data,
    });
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return prisma.project.delete({
      where: { id: input.id },
    });
  }),
});
