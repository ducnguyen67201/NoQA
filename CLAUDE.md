# NoQa - Claude Code Context

## Project Overview
NoQa is a document management and AI-powered Q&A system. It provides document storage, vector embeddings, and intelligent search capabilities.

## Tech Stack
- **Monorepo**: pnpm 9.15 workspaces + Turborepo 2.5
- **Web**: Next.js 16, React 19, TypeScript 5.7, Tailwind CSS 3.4, shadcn/ui
- **Worker**: Node.js 20+ with TypeScript 5.7
- **Database**: PostgreSQL with Prisma 7 + pgvector extension
- **Auth**: NextAuth.js v5 (Auth.js)
- **API**: tRPC 11 with React Query
- **Linting**: Biome

## Project Structure
```
NoQa/
├── apps/
│   ├── web/                     # Next.js web application
│   │   └── src/
│   │       ├── app/             # App Router pages
│   │       │   ├── (auth)/      # Auth pages (login)
│   │       │   ├── (dashboard)/ # Dashboard pages
│   │       │   └── api/         # API routes (auth, tRPC)
│   │       ├── components/      # React components
│   │       │   └── ui/          # shadcn/ui primitives
│   │       ├── hooks/           # Custom React hooks
│   │       ├── lib/             # Utilities & helpers
│   │       └── types/           # App-specific types
│   └── worker/                  # Background worker service
│       └── src/
├── packages/
│   ├── api/                     # tRPC routers + schemas
│   │   └── src/
│   │       ├── routers/         # tRPC routers
│   │       └── schemas/         # Zod schemas (source of truth)
│   ├── config-typescript/       # Shared TypeScript config
│   ├── db/                      # Prisma schema & client
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema
│   └── shared/                  # Shared utilities & constants
│       └── src/
├── biome.json                   # Biome linter config
├── turbo.json                   # Turborepo config
├── docker-compose.yml           # PostgreSQL container
├── Makefile                     # Root commands
└── package.json
```

## Commands

### Development
```bash
# Install all dependencies
pnpm install

# Start database
docker compose up -d

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start all apps
pnpm dev

# Start specific app
pnpm dev:web
pnpm dev:worker
```

### Database
```bash
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema changes (dev only)
pnpm db:migrate      # Create and run migration
pnpm db:studio       # Open Prisma Studio
pnpm db:reset        # Reset database
```

### Code Quality
```bash
pnpm lint            # Run Biome linter
pnpm lint:fix        # Auto-fix linting issues
pnpm format          # Format code
pnpm typecheck       # Run TypeScript checks
```

## Database Schema
Core models in `packages/db/prisma/schema.prisma`:
- **User**: User accounts with auth support
- **Account/Session**: NextAuth.js models
- **Project**: Container for documents and API keys
- **ApiKey**: Authentication keys per project
- **Document**: Stored documents with metadata
- **DocumentChunk**: Chunked content with vector embeddings

## Shared Type Packages - Single Source of Truth (CRITICAL)

**ALWAYS use shared type packages.** Never duplicate types across apps.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TYPE FLOW (Single Source of Truth)               │
└─────────────────────────────────────────────────────────────────────┘

    packages/db/prisma/schema.prisma
    (Database models)
          │
          ▼
    ┌─────────────┐
    │prisma generate│
    └─────────────┘
          │
          ▼
┌──────────────────────┐
│     @noqa/db         │  ← Database types & Prisma client
└──────────────────────┘
          │
          ▼
┌──────────────────────┐
│     @noqa/api        │  ← tRPC routers + Zod schemas
│  @noqa/api/schemas   │  ← Client-safe imports (no server deps)
└──────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  apps/web        │        apps/worker        │
└──────────────────────────────────────────────┘

RULE: Always import from shared packages, NEVER duplicate types!
```

### Import Rules

```tsx
// ❌ BAD - Duplicating types
interface Project {
  id: string;
  name: string;
}

// ❌ BAD - Direct Prisma import
import { Project } from "@prisma/client";

// ✅ GOOD - Use shared packages
import { type Project, type Document, type ApiKey } from "@noqa/db";
import { type CreateProjectInput, projectStatusSchema } from "@noqa/api/schemas";
```

**Available shared packages:**
| Package | Purpose | Example Imports |
|---------|---------|-----------------|
| `@noqa/db` | Database types & Prisma client | `Project`, `Document`, `ApiKey`, `prisma` |
| `@noqa/api/schemas` | Zod schemas & derived types (client-safe) | `createProjectSchema`, `apiKeySchema` |
| `@noqa/api` | tRPC routers & server utilities | `appRouter`, `createContext` |
| `@noqa/shared` | Cross-app utilities & constants | Environment configs, shared helpers |

## Database Migrations (CRITICAL)

**ALWAYS create a migration when editing Prisma schemas.**

```bash
# After ANY change to packages/db/prisma/schema.prisma
pnpm db:migrate --name <descriptive_name>

# Examples:
pnpm db:migrate --name add_document_status
pnpm db:migrate --name add_user_preferences
```

**Migration naming conventions:**
- Use snake_case: `add_document_status`, NOT `addDocumentStatus`
- Be descriptive: `add_user_avatar_column`, NOT `update`

---

# Code Style Rules

## No Inline Functions
- **Never use inline arrow functions in JSX** - Extract to named functions or handlers
- Define event handlers outside JSX: `const handleClick = () => {}` not `onClick={() => {}}`
- Extract callbacks passed to hooks: `const fetchData = useCallback(...)` not inline in deps

```tsx
// BAD
<Button onClick={() => setOpen(true)}>Open</Button>
{items.map((item) => <Item key={item.id} {...item} />)}

// GOOD
const handleOpen = () => setOpen(true);
const renderItem = (item: Item) => <Item key={item.id} {...item} />;

<Button onClick={handleOpen}>Open</Button>
{items.map(renderItem)}
```

## Constants
- **Use UPPER_SNAKE_CASE for constants**
- Define constants at module level, not inside components
- For complex/shared constants, create a dedicated `constants.ts` file
- Group related constants in objects when appropriate

```tsx
// Simple constants - top of file
const MAX_ITEMS = 10;
const API_TIMEOUT = 5000;

// Complex constants - separate file (e.g., src/lib/constants.ts)
export const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
] as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in",
  NOT_FOUND: "Resource not found",
} as const;
```

## Enums - Zod Schema Pattern (CRITICAL)

**Define enums as Zod schemas first, then derive constants and types from them.**

Use **camelCase** for enum values (not UPPER_CASE).

```typescript
// ✅ GOOD - Zod schema as source of truth
// packages/api/src/schemas/project.ts
import { z } from "zod";

// 1. Define the enum values array
const projectStatus = ["active", "archived", "deleted"] as const;

// 2. Create Zod schema from the array
export const projectStatusSchema = z.enum(projectStatus);

// 3. Derive the type from schema
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Usage in code
const status: ProjectStatus = "active";  // Type-safe
projectStatus.forEach(s => console.log(s));  // Iterate values
projectStatusSchema.parse(input);  // Runtime validation

// ❌ BAD - UPPER_CASE values
export const ProjectStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "DELETED"]);

// ❌ BAD - Hardcoded without Zod
export const PROJECT_STATUS = ["active", "archived", "deleted"] as const;
export type ProjectStatus = typeof PROJECT_STATUS[number];
```

### Complete Enum Pattern Example

```typescript
// packages/api/src/schemas/roles.ts
import { z } from "zod";

// Define enum values (camelCase)
const projectRole = ["owner", "admin", "member", "viewer"] as const;

// Create Zod schema
export const projectRoleSchema = z.enum(projectRole);

// Derive type
export type ProjectRole = z.infer<typeof projectRoleSchema>;

// Derive subsets from the values
export const adminRoles: readonly ProjectRole[] = ["owner", "admin"];
export const writeRoles: readonly ProjectRole[] = ["owner", "admin", "member"];

// Validation helpers
export const isValidRole = (role: string): role is ProjectRole => {
  return projectRoleSchema.safeParse(role).success;
};

export const isAdminRole = (role: ProjectRole): boolean => {
  return adminRoles.includes(role);
};
```

### Naming Convention Summary

| Item | Convention | Example |
|------|------------|---------|
| Enum values array | camelCase | `const projectStatus = ["active", ...]` |
| Zod schema | camelCase + Schema | `projectStatusSchema` |
| Type | PascalCase | `type ProjectStatus` |
| Derived subsets | camelCase | `adminRoles`, `writeRoles` |

## Zod Schemas as Source of Truth

- **Define types as Zod schemas first** - Infer TypeScript types from schemas
- **Store schemas in `packages/api/src/schemas/`** - Centralized location
- **Never hardcode constants for enums/unions** - Define as Zod schema, derive from it
- **Export both schema and inferred type**
- **Client components**: Import from `@noqa/api/schemas` (NOT `@noqa/api`)
- **Naming conventions**:
  - Schema names: `camelCase` + Schema suffix → `projectStatusSchema`, `createUserSchema`
  - Type names: `PascalCase` → `ProjectStatus`, `CreateUserInput`
  - Enum values: `camelCase` → `["active", "archived"]`, NOT `["ACTIVE", "ARCHIVED"]`

## Zod for Runtime Validation (CRITICAL - MANDATORY)

**ALL unknown data MUST be validated through Zod. No exceptions.**

Type assertions (`as`) are FORBIDDEN for unknown data. Every piece of external data must pass through Zod validation.

**The Rule:**
```
Unknown Data → Zod Schema → safeParse() → Use validated data
```

**What counts as unknown data:**
- `fetch()` responses (external APIs, internal APIs)
- `response.json()` results
- `JSON.parse()` output
- WebSocket messages
- URL query parameters
- Environment variables (at runtime)
- Any data crossing trust boundaries

```typescript
// ❌ FORBIDDEN - Type assertion bypasses runtime safety
const response = await fetch("/api/data");
const data = (await response.json()) as { users: User[] };
// NEVER do this - silent runtime failures

// ✅ REQUIRED - Zod validation (the ONLY acceptable pattern)
import { z } from "zod";

const ResponseSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  })),
});

const json: unknown = await response.json();
const parsed = ResponseSchema.safeParse(json);

if (!parsed.success) {
  console.error("Validation failed:", parsed.error.flatten());
  return null;
}

const data = parsed.data;  // NOW it's safe to use - fully typed
```

**Validation requirements by scenario:**
| Scenario | Zod Required? | Notes |
|----------|---------------|-------|
| External API response | ✅ MANDATORY | Always validate `fetch()` responses |
| Internal API response | ✅ MANDATORY | Worker → Web, service → service |
| `JSON.parse()` result | ✅ MANDATORY | Stored JSON, config files |
| WebSocket messages | ✅ MANDATORY | Real-time data from server |
| URL query params | ✅ MANDATORY | User-controlled input |
| Form data (tRPC) | ✅ Auto-handled | tRPC validates with input schema |
| Database results | ❌ Not needed | Prisma types are trustworthy |
| Internal function params | ❌ Not needed | TypeScript compile-time safety |

---

# Frontend Engineering Best Practices

## Function Decomposition
- **Break large functions into smaller, focused functions** - Each function should do ONE thing
- **Functions over 20-30 lines are candidates for splitting**
- **Name functions by what they do, not how** - `validateEmail` not `checkStringForAtSymbol`
- **Pure functions are preferred** - Same input always produces same output

```tsx
// BAD - Monolithic function
function handleSubmit(data: FormData) {
  const errors: string[] = [];
  if (!data.email) errors.push("Email required");
  if (!data.email.includes("@")) errors.push("Invalid email");
  // ... 50+ more lines of validation, API calls, state updates
}

// GOOD - Decomposed into focused functions
// src/lib/validation/auth.ts
const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!email.includes("@")) return "Invalid email format";
  return null;
};

export const validateRegistration = (data: FormData): string[] => {
  const errors: string[] = [];
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);
  return errors;
};

// src/hooks/use-registration.ts
export function useRegistration() {
  const register = useCallback(async (data: FormData) => {
    const errors = validateRegistration(data);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
    // ... API call
  }, []);

  return { register, errors, isLoading };
}
```

## Shared Utilities
- **Create reusable utilities in `src/lib/`** - Formatting, validation, API helpers
- **Cross-package utilities go in `packages/shared/`** - Used by multiple apps
- **Group utilities by domain** - `lib/format.ts`, `lib/date.ts`, `lib/validation.ts`
- **Utilities must be pure functions** - No React hooks, no side effects

```tsx
// GOOD - Centralized utility functions
// src/lib/format.ts
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
```

## Component Optimization
- **Use React.memo for expensive pure components**
- **Use useMemo for expensive computations**
- **Use useCallback for stable function references**
- **Lazy load heavy components** - `next/dynamic`
- **Virtualize long lists** - `@tanstack/react-virtual` for 100+ items

```tsx
// GOOD - Optimized with memoization
const DocumentRow = memo(function DocumentRow({ doc, onClick }: Props) {
  return (
    <div onClick={onClick}>
      <span>{doc.title}</span>
    </div>
  );
});

function DocumentList({ documents, filter }: Props) {
  // Memoize expensive computation
  const filtered = useMemo(() => {
    return documents.filter((d) => d.status === filter);
  }, [documents, filter]);

  // Stable function reference
  const handleClick = useCallback((id: string) => {
    router.push(`/documents/${id}`);
  }, [router]);

  return filtered.map((doc) => (
    <DocumentRow key={doc.id} doc={doc} onClick={() => handleClick(doc.id)} />
  ));
}
```

## Performance Patterns
- **Avoid prop drilling** - Use context or composition
- **Debounce user inputs** - Search, filters, form fields
- **Throttle scroll/resize handlers**
- **Use Suspense boundaries** - Graceful loading states

```tsx
// GOOD - Debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return <Input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

## URL State Synchronization (Panels, Modals, Tabs)
- **Sync UI state to URL query params** - Panels, modals, tabs should update URL
- **Read URL params on mount** - Auto-open panels when URL contains params
- **Clear URL params on close** - Remove params when closing
- **Enable shareable/bookmarkable state**

```tsx
// GOOD - State synced to URL
function DocumentPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const docParam = searchParams.get("doc");
    if (docParam) setIsOpen(true);
  }, [searchParams]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    const params = new URLSearchParams(searchParams.toString());

    if (open) {
      params.set("doc", "panel");
    } else {
      params.delete("doc");
    }

    const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  return <Sheet open={isOpen} onOpenChange={handleOpenChange} />;
}
```

## Prevent Race Conditions
- **Never use check-then-act patterns**
- **Use atomic operations** - Single database call for conditional mutations
- **Use transactions** for multiple dependent operations
- **Handle conflicts gracefully** - Catch errors instead of pre-checking

```typescript
// BAD - Race condition between findFirst and delete
const record = await prisma.apiKey.findFirst({ where: { id, projectId } });
if (!record) throw new Error("Not found");
await prisma.apiKey.delete({ where: { id } });

// GOOD - Single atomic operation
try {
  await prisma.apiKey.delete({ where: { id, projectId } });
} catch (e) {
  if (e.code === "P2025") throw new TRPCError({ code: "NOT_FOUND" });
  throw e;
}

// GOOD - Transaction for multiple dependent operations
await prisma.$transaction(async (tx) => {
  const key = await tx.apiKey.findUniqueOrThrow({ where: { id } });
  await tx.auditLog.create({ data: { action: "delete", targetId: key.id } });
  await tx.apiKey.delete({ where: { id } });
});
```

---

# Backend Architecture (API Layer)

## Directory Structure
```
packages/api/src/
├── routers/
│   ├── index.ts              # Root router (merges all)
│   ├── project.ts            # Project router
│   └── internal.ts           # Internal procedures
├── schemas/
│   ├── project.ts            # Project Zod schemas
│   └── index.ts              # Re-exports all schemas
└── trpc.ts                   # tRPC setup
```

## Router → Service Pattern
Routers are thin. Business logic lives in services.

```tsx
// ✅ GOOD - Thin router + service
// routers/project.ts
import { ProjectService } from "../services/project.service";
import { createProjectSchema } from "../schemas/project";

export const projectRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return ProjectService.create(ctx.db, ctx.user, input);
    }),

  getById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ProjectService.getById(ctx.db, input.projectId, ctx.user);
    }),
});

// services/project.service.ts
import { type PrismaClient, type Project, type User } from "@noqa/db";
import { type CreateProjectInput } from "../schemas/project";

export class ProjectService {
  static async create(
    db: PrismaClient,
    user: User,
    input: CreateProjectInput
  ): Promise<Project> {
    return db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { ...input, createdById: user.id },
      });
      return project;
    });
  }
}
```

## Schema Organization
```tsx
// schemas/project.ts
import { z } from "zod";

// Enum schemas (camelCase values, camelCase schema name)
const projectStatus = ["active", "archived", "deleted"] as const;
export const projectStatusSchema = z.enum(projectStatus);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Input schemas (camelCase schema name)
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  projectId: z.string(),
});

// Derived types (PascalCase)
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

---

# Frontend Architecture

## File Size Rule
- **Keep files under 150-200 lines** - If larger, split into smaller modules
- **One component per file** - No multiple exports of components
- **One hook per file** - Complex hooks get their own file

## Directory Structure
```
apps/web/src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/               # Auth pages
│   │   └── login/
│   ├── (dashboard)/          # Dashboard pages
│   └── api/                  # API routes
│       ├── auth/             # NextAuth routes
│       └── trpc/             # tRPC handler
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── projects/             # Domain: Project components
│   ├── documents/            # Domain: Document components
│   └── shared/               # Cross-domain components
├── hooks/
│   ├── use-projects.ts       # Domain hooks
│   └── use-debounce.ts       # Utility hooks
├── lib/
│   ├── utils.ts              # General utilities
│   └── format.ts             # Formatting utilities
└── types/
    └── index.ts              # App-specific types
```

## Component Architecture Pattern

```tsx
// ❌ BAD - Fat component with everything inline
function ProjectPage({ projectId }: Props) {
  const [project, setProject] = useState(null);
  // 200+ lines of logic and JSX...
}

// ✅ GOOD - Thin component + domain hook + sub-components
// hooks/use-project-detail.ts
export function useProjectDetail(projectId: string) {
  const { data: project, isLoading } = api.project.getById.useQuery({ projectId });
  return { project, isLoading };
}

// components/projects/project-detail-page.tsx (< 50 lines)
export function ProjectDetailPage({ projectId }: Props) {
  const { project, isLoading } = useProjectDetail(projectId);

  if (isLoading) return <Skeleton />;
  if (!project) return <NotFound />;

  return (
    <div>
      <ProjectHeader project={project} />
      <ProjectContent project={project} />
    </div>
  );
}
```

---

# Quick Reference

## Key Locations
- **Database schema**: `packages/db/prisma/schema.prisma`
- **tRPC routers**: `packages/api/src/routers/`
- **Zod schemas**: `packages/api/src/schemas/`
- **Shared utilities**: `packages/shared/src/`

## Critical Rules Summary
| Rule | What to Do | What NOT to Do |
|------|-----------|----------------|
| **Types** | Import from `@noqa/db`, `@noqa/api/schemas` | Duplicate types, import from `@prisma/client` |
| **Enums** | Use Zod schema with camelCase values | UPPER_CASE values, hardcode with `as const` |
| **Schema Names** | camelCase: `projectStatusSchema` | PascalCase: `ProjectStatusSchema` |
| **Type Names** | PascalCase: `ProjectStatus` | camelCase: `projectStatus` |
| **Unknown Data** | Use Zod `safeParse()` | Type assertions (`as`) |
| **UI** | Use shadcn/ui from `@/components/ui/` | Custom CSS for standard elements |
| **Frontend** | < 150 lines, logic in hooks | Fat components, inline logic |
| **Backend** | Thin routers + service files | Business logic in routers |
| **Migrations** | Run `pnpm db:migrate --name <name>` | Edit schemas without migration |
