# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs both frontend and backend)
npm run dev

# Build for production (builds both frontend and backend)
npm run build

# Start production server
npm start

# Type checking
npm run check

# Push database schema changes to PostgreSQL
npm run db:push
```

## Project Architecture

StockSenseAI is a full-stack TypeScript monorepo with a React frontend and Express backend, built for AI-powered inventory management targeting small retailers and restaurants.

### Monorepo Structure

- **`/client`** - React frontend with Vite
- **`/server`** - Express backend with TypeScript
- **`/shared`** - Shared TypeScript schemas and types used by both frontend and backend

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` → `./client/src/*` (frontend imports)
- `@shared/*` → `./shared/*` (shared schemas/types)

### Key Architectural Patterns

#### Database Layer (Drizzle ORM)

The database schema is defined in `shared/schema.ts` using Drizzle ORM. This single source of truth provides:
- Type-safe database operations across frontend and backend
- Automatic TypeScript type inference
- Zod validation schemas generated from table definitions

**Important**: The schema uses Replit Auth compatibility:
- User IDs are `varchar` not `serial` to support external auth providers
- Session table includes required `sid`, `sess`, and `expire` columns

#### Storage Abstraction Layer

`server/storage.ts` provides a clean abstraction over database operations. All database queries should go through this layer rather than directly using Drizzle queries in routes. Key patterns:

```typescript
// Good - use storage layer
const user = await storage.getUser(userId);

// Avoid - direct database queries in routes
const user = await db.select().from(users).where(eq(users.id, userId));
```

The storage layer handles:
- Complex joins (e.g., inventory with product details)
- Consistent error handling
- Business logic consolidation
- Multi-tenant data isolation by userId

#### Authentication Flow

Replit Auth is integrated via OpenID Connect in `server/replitAuth.ts`:
1. Auth middleware (`setupAuth`) configures Passport and session management
2. Sessions stored in PostgreSQL via `connect-pg-simple`
3. Protected routes use `isAuthenticated` middleware
4. User context available as `req.user.claims.sub` in authenticated routes

**Demo Mode**: A mock user ID "1" exists for demo purposes. The demo cleanup service (`server/demo-cleanup.ts`) runs every 8 hours to reset demo data.

#### API Design Patterns

Routes in `server/routes.ts` follow consistent patterns:

1. **Authentication**: Most routes require `isAuthenticated` middleware
2. **User Isolation**: Operations filter by `req.user.claims.sub` to ensure multi-tenant isolation
3. **Validation**: Use Zod schemas from `shared/schema.ts` for request validation
4. **Error Handling**: Consistent JSON error responses with appropriate HTTP status codes

Example pattern:
```typescript
app.get('/api/resource', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = await storage.getData(userId);
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
});
```

#### Frontend Architecture

**State Management**:
- TanStack Query (React Query) for server state with 5-minute stale time
- Queries use centralized `queryClient` from `client/src/lib/queryClient.ts`
- Authentication context in `client/src/contexts/auth-context.tsx`

**Component Organization**:
- `/components/ui` - shadcn/ui components (Radix UI primitives)
- `/components/*` - Feature-specific components (dashboard, analytics, etc.)
- `/pages` - Route components
- `/hooks` - Custom React hooks for data fetching and business logic
- `/lib` - Utilities (queryClient, authUtils, types, utils)

**Routing**: Uses Wouter for client-side routing (lightweight alternative to React Router)

**Styling**: Tailwind CSS with CSS variables for theming. The design system uses shadcn/ui conventions.

#### AI Integration

The AI assistant (`server/ai-assistant.ts`) uses Google's Gemini API:
- Generates proactive inventory recommendations
- Analyzes demand patterns and waste trends
- Provides natural language insights via chat interface
- Memoized to avoid duplicate API calls for same data

**Environment Variable**: Requires `GEMINI_API_KEY` for AI features

#### Demo Data Management

The `server/demo-cleanup.ts` service handles:
- Auto-cleanup of sessions older than 8 hours
- Periodic reset of demo inventory to default state
- Protection of specific user IDs (demo user "1" and production users)
- Deletion of test AI recommendations and waste records

This prevents database costs from spiraling when the app is publicly shared.

## Database Schema Management

Database migrations are handled via Drizzle Kit:

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if using migration files)
npx drizzle-kit generate

# View database studio
npx drizzle-kit studio
```

**Important**: The schema uses PostgreSQL with Neon serverless. Connection string must be in `DATABASE_URL` environment variable.

## Key Business Logic

### Multi-Location Support
- Organizations can have multiple locations
- Users have default location and location-specific access controls
- Inventory tracked per-location via `locationId` foreign key

### Role-Based Permissions
- Users have roles: 'admin', 'manager', 'user', 'viewer'
- Permissions stored as JSONB array in users table
- Permission audit logs track access control changes

### Achievement System
- Gamification via achievements, user achievements, and user stats tables
- Achievement progress tracked and updated based on user actions
- Integration with frontend achievement dashboard

### Waste Tracking
- Perishable products have `shelfLifeDays` and `isPerishable` flags
- Waste records track expired/damaged inventory
- AI analyzes waste patterns for optimization recommendations

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Express session secret (auto-generated if missing)
- `REPLIT_DEPLOYMENT` - Set to "1" in production for Replit Auth
- `REPLIT_DOMAINS` - Production domain for OIDC redirects

Optional:
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `NODE_ENV` - "development" or "production"

## Important Conventions

1. **User ID Type**: Always use `string` for user IDs (Replit Auth compatibility)
2. **Decimal Fields**: Use `string` for prices/decimals in API (e.g., "3.50" not 3.50)
3. **Timestamps**: Drizzle handles `createdAt`/`updatedAt` automatically via `.defaultNow()`
4. **Image URLs**: Most product images use Unsplash with size parameters (w=100&h=100&fit=crop)
5. **Error Logging**: Always log errors with `console.error()` before sending error responses

## Frontend Data Fetching Patterns

Use custom hooks for data fetching:
- `useAuth()` - Current user and authentication state
- `use-inventory.ts` - Inventory data and mutations
- `use-ai-recommendations.ts` - AI recommendations
- `use-spoilage-prediction.ts` - Spoilage predictions

Query keys follow pattern: `['/api', 'resource', params...]`

## Testing Notes

This project currently does not have automated tests. When adding tests:
- Place test files next to source files with `.test.ts` suffix
- Use TypeScript for all test files
- Mock database calls via storage layer
- Mock AI API calls to avoid costs
