# EventHub Saudi Arabia - Event Management Platform

## Overview
EventHub is a comprehensive event management platform designed for the Saudi Arabian market. It serves as a digital marketplace connecting event organizers, attendees, service providers, and sponsors. The platform facilitates event creation, discovery, and management, alongside bookings for services like catering and photography, and event sponsorships. It supports multiple user roles (admin, organizer, attendee, service_provider, sponsor), offers bilingual support (English/Arabic) with RTL layout, and is built as a full-stack web application tailored for the Saudi market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
-   **Framework**: React with TypeScript (Vite build tool)
-   **Routing**: Wouter (client-side, role-based access)
-   **UI**: shadcn/ui (Radix UI primitives), Tailwind CSS (theming, Saudi-specific colors)
-   **State Management**: TanStack Query
-   **Form Handling**: React Hook Form with Zod validation
-   **Internationalization**: Custom language provider (English/Arabic, RTL)

### Backend
-   **Runtime**: Node.js with Express.js
-   **Build**: ESBuild (production), tsx (development)
-   **API**: RESTful
-   **Authentication**: Replit OpenID Connect (OIDC)
-   **Session Management**: Express sessions (PostgreSQL storage)

### Data Storage
-   **Database**: PostgreSQL (Neon serverless)
-   **ORM**: Drizzle ORM
-   **Schema Management**: Drizzle Kit

### Authentication & Authorization
-   **Provider**: Replit Auth (OpenID Connect)
-   **Session Handling**: Server-side, httpOnly cookies
-   **Role-Based Access**: Five roles (admin, organizer, attendee, service_provider, sponsor) with route protection
-   **User Management**: Automatic creation/updates via OIDC claims

### Core Features
-   **Event Management**: CRUD operations, categorization, search.
-   **Registration**: Tracking, capacity management.
-   **Service Provider Marketplace**: Profiles, reviews, booking.
-   **Sponsorship Management**: Allows organizers to manage sponsors for their events and sponsors to manage their profiles. Includes dedicated pages for sponsor listings and details, with bilingual support.
-   **Messaging**: Real-time communication.
-   **Review & Rating**: Bidirectional for events and providers.
-   **Admin Dashboard**: Oversight and management tools, including role-based redirects.

## External Dependencies

### Database & Storage
-   `@neondatabase/serverless`
-   `drizzle-orm`
-   `drizzle-kit`
-   `connect-pg-simple`

### Authentication & Security
-   `openid-client`
-   `passport`
-   `express-session`

### Frontend Libraries
-   `@tanstack/react-query`
-   `@hookform/resolvers`
-   `wouter`
-   `@radix-ui/*`
-   `lucide-react`
-   `date-fns`

### Development Tools
-   `tsx`
-   `esbuild`
-   `@replit/vite-plugin-*`
-   `tailwindcss`
-   `postcss`

### Utility Libraries
-   `clsx`
-   `tailwind-merge`
-   `class-variance-authority`
-   `zod`
-   `memoizee`