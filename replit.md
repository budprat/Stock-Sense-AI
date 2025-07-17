# StockSense - AI-Powered Inventory Management Platform

## Overview

StockSense is a modern AI-powered inventory management platform designed for small retailers and restaurants (1-10 locations, $500K-$5M revenue). The application features a React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data storage and providing real-time inventory tracking, AI-powered recommendations, and comprehensive analytics.

The platform targets the $3.58B inventory management market with a focus on reducing 20-30% inventory waste through AI-driven demand forecasting, automated reordering, and spoilage prediction. Target pricing is $99-$249/month with potential $5,000 monthly savings for customers.

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

## Key Components

### Database Schema
- **Users**: Authentication and profile management
- **Products**: Inventory items with categories and pricing
- **Inventory**: Stock levels, reorder points, and expiration tracking
- **Suppliers**: Vendor management and performance tracking
- **AI Recommendations**: ML-generated suggestions for inventory optimization
- **Waste Records**: Tracking of expired and wasted inventory
- **Demand Forecast**: Historical and predicted demand patterns

### AI Features
- **Demand Forecasting**: Predicts future inventory needs
- **Recommendation Engine**: Suggests reorder quantities and timing
- **Waste Analysis**: Identifies patterns in inventory waste
- **Supplier Performance**: Evaluates vendor reliability and quality

### User Interface
- **Dashboard**: Comprehensive overview with critical alerts and quick stats
- **Inventory Management**: Real-time stock tracking with health indicators
- **Analytics**: Visual charts for demand forecasting and waste analysis
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