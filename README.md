# StockSenseAI

> AI-Powered Inventory Management Platform for Small Retailers and Restaurants

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933.svg)](https://nodejs.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

StockSenseAI is a modern, AI-powered inventory management platform designed specifically for small retailers and restaurants (1-10 locations, $500K-$5M revenue). The platform helps businesses reduce 20-30% inventory waste through AI-driven demand forecasting, automated reordering, and spoilage prediction.

### Market Positioning

- **Target Market**: $3.58B inventory management market
- **Value Proposition**: "End Your Inventory Nightmare in 5 Minutes"
- **Potential Savings**: Up to $5,000 monthly for customers
- **User-Friendly**: Simple interface for non-technical users aged 25-70

### Pricing Tiers

- **Free Tier**: $0 forever (1 location, 50 products)
- **Professional**: $49/month (3 locations, unlimited products)
- **Enterprise**: $99/month (unlimited locations, advanced features)

## ✨ Features

### Core Functionality

- **Real-Time Inventory Tracking** - Monitor stock levels across multiple locations with emoji-based health indicators
- **AI-Powered Recommendations** - Get proactive suggestions for reordering, waste reduction, and optimization
- **Demand Forecasting** - Predict future inventory needs with seasonal trends and pattern recognition
- **Multi-Location Support** - Manage inventory across multiple locations with location-specific tracking
- **Spoilage Prediction** - Track perishable items and get alerts before products expire
- **Barcode Scanning** - Real barcode scanning using camera API for quick product lookup

### Analytics & Reporting

- **Inventory Health Score** - Single 0-100 score combining all metrics with visual progress bars
- **Advanced Analytics** - ABC analysis, predictive modeling, and comprehensive dashboards
- **Custom Reports** - Template-based reporting with scheduling and PDF/Excel/CSV export
- **Waste Analysis** - Identify patterns in inventory waste to reduce costs

### User Experience

- **Notification Center** - Dedicated center with categorized alerts, action buttons, and priority filtering
- **SMS Daily Summary** - Morning text alerts for low stock items with reorder links
- **One-Click Supplier Connection** - Instant supplier setup with progress tracking
- **Competitor Import** - Easy migration from Zoho, Sortly, Excel, QuickBooks
- **Large Button Mode** - Accessibility feature with 50% larger UI
- **Dark Mode** - Theme switching for comfortable viewing
- **Mobile-First Design** - Responsive interface optimized for mobile devices

### Gamification & Engagement

- **Achievement System** - Earn badges and points for inventory management milestones
- **User Stats Tracking** - Monitor your progress and performance over time
- **Leaderboards** - Compare performance with other users (Enterprise tier)

### Business Features

- **Role-Based Access Control** - Granular permissions for admin, manager, user, and viewer roles
- **Permission Audit Log** - Complete audit trail for security and compliance
- **Supplier Management** - Track vendor performance and reliability
- **Automated Purchase Orders** - Generate POs automatically based on reorder points
- **Lead Magnet Calculator** - Interactive tool to calculate potential savings

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4 (fast development and optimized builds)
- **Routing**: Wouter 3.3 (lightweight client-side routing)
- **State Management**: TanStack Query 5.60 (React Query for server state)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS 3.4 with CSS variables for theming
- **Charts**: Recharts 2.15 for data visualization
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation

### Backend

- **Runtime**: Node.js 20 with Express.js 4.21
- **Language**: TypeScript 5.6 with ES modules
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM 0.39 for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (Passport.js)
- **Session Store**: PostgreSQL with connect-pg-simple
- **API Design**: RESTful API with consistent JSON responses

### AI & Machine Learning

- **AI Provider**: Google Gemini API (@google/genai)
- **Features**: Demand forecasting, waste analysis, recommendation engine
- **Memoization**: Cached responses to reduce API costs

### DevOps & Deployment

- **Deployment**: Replit Autoscale
- **Database Hosting**: Neon PostgreSQL serverless
- **Build System**: esbuild for production builds
- **Development**: tsx for TypeScript execution
- **Version Control**: Git with GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (Neon account recommended)
- Git
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/budprat/StockSenseAI.git
   cd StockSenseAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your actual values (see [Environment Variables](#environment-variables) section).

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5000`

### Quick Start for Demo

The application includes demo data for quick testing. On first run, the demo user (ID: "1") will be automatically created with sample products and inventory.

## 📁 Project Structure

```
StockSenseAI/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # React components
│       │   ├── ui/        # shadcn/ui base components
│       │   ├── dashboard/ # Dashboard-specific components
│       │   ├── analytics/ # Analytics components
│       │   └── ...        # Other feature components
│       ├── pages/         # Route components
│       ├── hooks/         # Custom React hooks
│       ├── contexts/      # React contexts (auth, etc.)
│       ├── lib/           # Utilities and helpers
│       └── main.tsx       # Application entry point
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Database abstraction layer
│   ├── replitAuth.ts     # Authentication setup
│   ├── ai-assistant.ts   # AI recommendation engine
│   ├── demo-cleanup.ts   # Demo data management
│   └── vite.ts           # Vite dev server setup
├── shared/               # Shared TypeScript code
│   └── schema.ts         # Drizzle ORM schema + Zod validation
├── .env.example          # Environment variables template
├── CLAUDE.md             # Claude Code documentation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── drizzle.config.ts     # Drizzle Kit configuration
```

### Key Architectural Patterns

**Monorepo Structure**: The project uses a monorepo pattern with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire stack.

**Path Aliases**:
- `@/*` → `./client/src/*` (frontend imports)
- `@shared/*` → `./shared/*` (shared schemas/types)

**Storage Abstraction**: All database operations go through `server/storage.ts` rather than direct Drizzle queries, providing:
- Consistent error handling
- Business logic consolidation
- Multi-tenant data isolation

**State Management**: TanStack Query handles all server state with 5-minute stale time and automatic caching.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server (frontend + backend)

# Production
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database

# Type Checking
npm run check           # Run TypeScript type checking
```

### Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make your changes**: Edit files in `client/src/` or `server/`
3. **Hot reload**: Changes are automatically reflected
4. **Type checking**: Run `npm run check` before committing
5. **Database changes**: Update `shared/schema.ts` and run `npm run db:push`

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use the storage layer for database operations
- Add error handling with `console.error()` before error responses
- Use Zod schemas from `shared/schema.ts` for validation
- Keep components small and focused
- Use custom hooks for data fetching

## 🔐 Environment Variables

### Setup

1. Copy `.env.example` to `.env`
2. Fill in your actual values
3. Never commit `.env` files to git

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Express session secret | Generate with: `openssl rand -base64 32` |
| `REPLIT_DOMAINS` | Production domains (comma-separated) | `your-app.replit.app,custom.com` |
| `REPL_ID` | Replit Auth client ID | Your Replit project ID |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | (AI disabled) |
| `DEMO_CLEANUP_SECRET` | Secret for demo cleanup endpoint | (no protection) |
| `ISSUER_URL` | OpenID Connect issuer URL | `https://replit.com/oidc` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `REPLIT_DEPLOYMENT` | Set to "1" in production | (not set) |

### Security Notes

- **Never commit `.env` files** - The `.gitignore` is configured to exclude them
- **Generate strong secrets** - Use `openssl rand -base64 32` for `SESSION_SECRET`
- **Rotate keys regularly** - Update API keys and secrets periodically
- **Limit access** - Only share credentials with authorized team members

## 🗄️ Database Management

### Schema Management with Drizzle

The database schema is defined in `shared/schema.ts` using Drizzle ORM. This provides:
- Type-safe database operations
- Automatic TypeScript type inference
- Zod validation schemas

### Common Database Operations

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if using migration files)
npx drizzle-kit generate

# View database in browser
npx drizzle-kit studio
```

### Database Schema Overview

**Core Tables**:
- `users` - User profiles with Replit Auth integration
- `organizations` - Multi-tenant business entities
- `locations` - Multi-location support
- `products` - Inventory items with categories
- `inventory` - Stock levels and reorder points
- `suppliers` - Vendor management

**AI & Analytics**:
- `aiRecommendations` - ML-generated suggestions
- `demandForecast` - Historical and predicted demand
- `wasteRecords` - Expired and wasted inventory tracking

**Access Control**:
- `roles` - Custom role definitions
- `userLocationAccess` - Granular access control
- `permissionAuditLog` - Security audit trail

**Gamification**:
- `achievements` - Achievement definitions
- `userAchievements` - User achievement progress
- `userStats` - User statistics tracking

### Important Notes

- User IDs are `varchar` (not `serial`) for Replit Auth compatibility
- Sessions are stored in PostgreSQL via `connect-pg-simple`
- Timestamps (`createdAt`, `updatedAt`) are handled automatically
- Decimal fields (prices) use `string` type in API (e.g., "3.50")

## 🔒 Security

### Security Features

✅ **No Hardcoded Secrets** - All sensitive data uses environment variables
✅ **Protected .env Files** - `.gitignore` excludes all `.env*` files
✅ **Session Security** - HTTP-only cookies with secure flag in production
✅ **Authentication** - Replit Auth with OpenID Connect
✅ **CSRF Protection** - Built into session management
✅ **SQL Injection Protection** - Parameterized queries via Drizzle ORM

### Security Best Practices

1. **Environment Variables**: Never hardcode secrets in code
2. **Session Secrets**: Use strong random strings (32+ characters)
3. **API Keys**: Store in environment variables, never in client code
4. **Database Credentials**: Use connection strings from environment
5. **Git History**: Use `git-secrets` to scan for accidentally committed secrets
6. **Access Control**: Implement role-based permissions for all sensitive operations
7. **Audit Logging**: Track permission changes and access patterns

### Demo Mode Security

The application includes a demo cleanup service that:
- Runs every 8 hours to reset demo data
- Protects specific user IDs from deletion
- Cleans up old sessions to prevent database bloat
- Can be manually triggered via `/api/demo/cleanup` (with optional secret)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the code style guidelines
4. **Test thoroughly**: Ensure all functionality works
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes in detail

### Development Guidelines

- Write TypeScript for all new code
- Follow existing patterns and conventions
- Add comments for complex logic
- Use the storage abstraction layer for database operations
- Test on multiple screen sizes (mobile-first)
- Ensure proper error handling
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Database by [Neon](https://neon.tech/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Deployed on [Replit](https://replit.com/)

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: demo@stocksense.com
- Documentation: See [CLAUDE.md](./CLAUDE.md) for technical details

---

**Built with ❤️ for small businesses who deserve better inventory management**
