import { z } from "zod";

// ============================================================================
// Project Schemas
// ============================================================================

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ============================================================================
// API Key Schemas
// ============================================================================

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  projectId: z.string(),
  expiresAt: z.date().optional(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;

// ============================================================================
// Document Schemas
// ============================================================================

// JSON-compatible value schema for Prisma
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

export const MetadataSchema = z.record(z.string(), JsonValueSchema).optional();

export const CreateDocumentSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  metadata: MetadataSchema,
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;

// ============================================================================
// Common Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const IdSchema = z.object({
  id: z.string(),
});
