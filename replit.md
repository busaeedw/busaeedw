# EventHub Saudi Arabia - Event Management Platform

## Overview
EventHub is a comprehensive digital marketplace for event management in Saudi Arabia. It connects event organizers, attendees, service providers, and sponsors, facilitating event creation, discovery, management, service bookings (e.g., catering, photography), and sponsorships. The platform supports multiple user roles, offers bilingual support (English/Arabic) with RTL layout, and is built as a full-stack web application.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
-   **Framework**: React with TypeScript (Vite)
-   **UI**: shadcn/ui (Radix UI primitives), Tailwind CSS (theming, Saudi-specific colors)
-   **Internationalization**: Custom language provider (English/Arabic, RTL layout)
-   **Routing**: Wouter (client-side, role-based access)

### Technical Implementations
-   **Backend**: Node.js with Express.js
-   **API**: RESTful
-   **Authentication**: Replit OpenID Connect (OIDC), server-side session management (PostgreSQL storage)
-   **State Management**: TanStack Query
-   **Form Handling**: React Hook Form with Zod validation
-   **Database**: PostgreSQL (Neon serverless)
-   **ORM**: Drizzle ORM (with Drizzle Kit for schema management)
-   **Build Tools**: ESBuild (production), tsx (development)

### Feature Specifications
-   **Event Management**: CRUD operations, categorization, search, registration tracking, capacity management. Organizers can associate up to 3 service providers and manage sponsorships.
-   **Service Provider Marketplace**: Profiles, reviews, booking, city-based filtering. Event detail pages display associated service providers.
-   **Sponsorship Management**: Dedicated pages for listing and details, bilingual support.
-   **User Roles**: Five distinct roles (admin, organizer, attendee, service_provider, sponsor) with role-based access control and route protection.
-   **Admin Dashboard**: Comprehensive oversight and management tools.
-   **Review & Rating**: Bidirectional for events and providers.
-   **Organizer "My Events" Page**: Dedicated page for organizers to view and manage their created events in a card grid layout, including status badges and quick actions.

### System Design Choices
-   **Robust Authentication**: Leverages Replit Auth (OIDC) with server-side session handling and httpOnly cookies, including multi-tier role claim handling and automatic user creation/updates. Handles various OIDC claim formats for user names.
-   **Scalable Database**: Utilizes serverless PostgreSQL for data persistence.
-   **Modular Frontend**: Component-based UI with strong typing (TypeScript) and modern state management.
-   **Localization**: Full bilingual support with RTL layout for Arabic, applied across all features including forms and error messages.
-   **File Uploads**: Implemented for sponsor logos with validation, secure storage, and static serving.

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
-   `multer`

### Frontend Libraries
-   `@tanstack/react-query`
-   `@hookform/resolvers`
-   `wouter`
-   `@radix-ui/*`
-   `lucide-react`
-   `date-fns`

### Development & Utility
-   `tsx`
-   `esbuild`
-   `@replit/vite-plugin-*`
-   `tailwindcss`
-   `postcss`
-   `clsx`
-   `tailwind-merge`
-   `class-variance-authority`
-   `zod`
-   `memoizee`