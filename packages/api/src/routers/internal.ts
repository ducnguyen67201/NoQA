import { prisma } from "@noqa/db";
import { z } from "zod";
import { createRouter, internalProcedure } from "../trpc.js";

// JSON-compatible value schema
const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ])
);

const MetadataSchema = z.record(z.string(), JsonValueSchema).optional();

/**
 * Internal router for service-to-service calls
 * All procedures require INTERNAL_API_SECRET
 */
export const internalRouter = createRouter({
  /**
   * Create document with chunks (for worker processing)
   */
  createDocumentWithChunks: internalProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        content: z.string(),
        chunks: z.array(
          z.object({
            content: z.string(),
            metadata: MetadataSchema,
          })
        ),
        metadata: MetadataSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { projectId, title, content, chunks, metadata } = input;

      return prisma.document.create({
        data: {
          projectId,
          title,
          content,
          metadata: metadata as object | undefined,
          chunks: {
            create: chunks.map((chunk) => ({
              content: chunk.content,
              metadata: chunk.metadata as object | undefined,
            })),
          },
        },
        include: { chunks: true },
      });
    }),

  /**
   * Update chunk embeddings (for worker processing)
   */
  updateChunkEmbedding: internalProcedure
    .input(
      z.object({
        chunkId: z.string(),
        embedding: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const { chunkId, embedding } = input;

      // Use raw query for vector update
      await prisma.$executeRaw`
        UPDATE document_chunks
        SET embedding = ${embedding}::vector
        WHERE id = ${chunkId}
      `;

      return { success: true };
    }),

  /**
   * Health check for internal services
   */
  healthCheck: internalProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});
