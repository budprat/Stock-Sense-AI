# StockSense - AI-Powered Inventory Management Platform

## Overview

StockSense is a modern AI-powered inventory management platform designed for small retailers and restaurants (1-10 locations, $500K-$5M revenue). The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data storage and providing real-time inventory tracking, AI-powered recommendations, and comprehensive analytics.

The platform targets the $3.58B inventory management market with a focus on reducing 20-30% inventory waste through AI-driven demand forecasting, automated reordering, and spoilage prediction. Target pricing is $99-$249/month with potential $5,000 monthly savings for customers.

**Recent Major Updates (January 2025):**
- Advanced analytics dashboard with demand forecasting, ABC analysis, and predictive modeling
- Custom reporting system with scheduled reports and export capabilities (PDF, Excel, CSV)
- Multi-location support with location-specific inventory tracking
- Role-based permissions system with granular access controls
- AI assistant integration with Gemini API for proactive inventory recommendations
- Complete "Inventory Hero" achievement system with badges, points, and gamification
- Replit Auth integration for secure user authentication and session management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless connection
- **API Design**: RESTful API with consistent JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth with OpenID Connect integration

## Key Components

### Database Schema
- **Sessions**: Session storage table for Replit Auth compatibility
- **Users**: User profiles with Replit Auth integration (varchar ID, email, profile info)
- **Organizations**: Multi-tenant support for business entities
- **Locations**: Multi-location support with address and management info
- **Products**: Inventory items with categories and pricing
- **Inventory**: Stock levels, reorder points, and location-specific tracking
- **Suppliers**: Vendor management and performance tracking
- **AI Recommendations**: ML-generated suggestions for inventory optimization
- **Waste Records**: Tracking of expired and wasted inventory
- **Demand Forecast**: Historical and predicted demand patterns
- **Roles**: Custom role definitions with permission sets
- **User Location Access**: Granular access control for multi-location operations
- **Permission Audit Log**: Comprehensive audit trail for security compliance
- **Achievements**: Gamification system with badges and points tracking
- **User Achievements**: Individual achievement progress and completion records
- **User Stats**: User statistics for achievements and progress tracking

### AI Features
- **Demand Forecasting**: Predicts future inventory needs with seasonal trends
- **Recommendation Engine**: Suggests reorder quantities and timing
- **Waste Analysis**: Identifies patterns in inventory waste
- **Supplier Performance**: Evaluates vendor reliability and quality
- **AI Assistant**: Real-time chat interface with proactive recommendations
- **Advanced Analytics**: Predictive modeling and ABC analysis
- **Custom Reporting**: Automated report generation with AI insights

### User Interface
- **Dashboard**: Comprehensive overview with critical alerts and quick stats
- **Inventory Management**: Real-time stock tracking with health indicators
- **Advanced Analytics**: Multi-tab interface with filtering and export capabilities
- **Custom Reports**: Template-based reporting with scheduling and automation
- **Location Management**: Multi-location support with access control
- **User Management**: Role-based permissions and user administration
- **Mobile-First**: Responsive design with mobile navigation
- **Dark Mode**: Theme switching capability

## Data Flow

### Client-Server Communication
1. Frontend makes API requests through a centralized query client
2. Backend processes requests and interacts with PostgreSQL database
3. Real-time updates via polling with TanStack Query
4. Error handling with toast notifications

### Database Operations
1. Drizzle ORM manages database schema migrations
2. Connection pooling with Neon serverless PostgreSQL
3. Type-safe queries with shared TypeScript schemas
4. Structured storage layer abstracts database operations

### AI Processing
1. Historical data analysis for demand forecasting
2. Pattern recognition for waste reduction
3. Supplier performance scoring
4. Automated reorder recommendations

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessibility
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build**: Vite with TypeScript compilation
- **Database**: Drizzle Kit for migrations and schema management
- **Development**: TSX for TypeScript execution
- **Linting**: ESBuild for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon development database instance
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Static assets built with Vite
- **Backend**: ESBuild compilation to ESM format
- **Database**: Neon production database with connection pooling
- **Deployment**: Single-server deployment with static file serving

### Key Features
- **Session Management**: PostgreSQL-backed sessions for user authentication
- **Real-time Updates**: Polling-based data synchronization
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized queries and caching strategies
- **Scalability**: Serverless database architecture for automatic scaling

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire stack. The AI-powered recommendations provide the core value proposition, helping small businesses optimize their inventory management through data-driven insights.