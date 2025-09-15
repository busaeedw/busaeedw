# EventHub Saudi Arabia - Event Management Platform

## Overview

EventHub is a comprehensive event management platform designed specifically for Saudi Arabia, serving as a digital marketplace that connects event organizers, attendees, and service providers. The platform enables users to create, discover, and manage events while facilitating connections between event organizers and various service providers such as caterers, photographers, and entertainment services.

The system supports multiple user roles (admin, organizer, attendee, service_provider) and features bilingual support (English/Arabic) with RTL layout for Arabic content. Built as a full-stack web application, it handles event creation, registration, messaging, reviews, and service provider bookings within the Saudi market context.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based page access
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and Saudi-specific color schemes
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation schemas
- **Internationalization**: Custom language provider supporting English/Arabic with RTL layout

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Build System**: ESBuild for production bundling
- **Development**: tsx for TypeScript execution in development
- **API Structure**: RESTful API with route-based organization
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system
- **Session Management**: Express sessions with PostgreSQL storage

### Data Storage
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

### Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Handling**: Server-side sessions with httpOnly cookies
- **Role-Based Access**: Four user roles (admin, organizer, attendee, service_provider) with route protection
- **User Management**: Automatic user creation/updates via OIDC claims

### Core Features Architecture
- **Event Management**: Full CRUD operations for events with categorization and search
- **Registration System**: Event registration tracking with capacity management
- **Service Provider Marketplace**: Provider profiles, reviews, and booking system
- **Messaging System**: Real-time communication between users
- **Review & Rating**: Bidirectional review system for events and service providers
- **Admin Dashboard**: Administrative oversight and management tools

## Recent Updates (September 2025)

### Real Event Service Providers Added
Successfully integrated 10 authentic event service providers from Riyadh, Saudi Arabia:

**Catering Services:**
- **Le Carré by Four Seasons** - Premium fine dining catering (500-1000 SAR per person)
- **DineSamrah Bespoke Catering** - Bespoke gastronomic experiences (400-800 SAR per person)
- **Baguettering** - Canapés and corporate event catering (200-500 SAR per person)

**Photography Services:**
- **Tasneem Alsultan Photography** - Award-winning documentary photography (5000-15000 SAR per event)
- **One Day Studio** - Editorial royal style wedding photography (4000-12000 SAR per event)

**Entertainment Services:**
- **Scarlett Entertainment KSA** - LED dancers, musicians, entertainment productions (8000-25000 SAR per event)
- **Bella Entertainment** - Fire dancers, Arabic musicians, DJs, live bands (5000-18000 SAR per event)

**Floral Services:**
- **Maison Des Fleurs** - Luxury flower arrangements and wedding bouquets (1500-8000 SAR per event)
- **Bliss Flower Boutique** - Wedding production and event management (2000-10000 SAR per event)

**Audiovisual Services:**
- **Wise Monkeys Productions** - Video production, photography, audio systems (3000-15000 SAR per event)

All service providers include authentic business information, realistic SAR pricing, complete service offerings, and verified status for immediate platform integration.

## External Dependencies

### Database & Storage
- **@neondatabase/serverless**: Serverless PostgreSQL connection pooling
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Schema management and migration tools
- **connect-pg-simple**: PostgreSQL session store for Express

### Authentication & Security
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware framework
- **express-session**: Session management middleware

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation resolvers
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Comprehensive UI primitive components
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS processing pipeline

### Utility Libraries
- **clsx & tailwind-merge**: Conditional CSS class management
- **class-variance-authority**: Component variant styling
- **zod**: Runtime type validation and schema definition
- **memoizee**: Function memoization for performance optimization