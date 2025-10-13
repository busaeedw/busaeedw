# EventHub Saudi Arabia - Event Management Platform

## Overview
EventHub is a comprehensive event management platform for Saudi Arabia, acting as a digital marketplace connecting event organizers, attendees, and service providers. It facilitates event creation, discovery, and management, alongside bookings for services like catering and photography. The platform supports multiple user roles (admin, organizer, attendee, service_provider), offers bilingual support (English/Arabic) with RTL layout, and is built as a full-stack web application tailored for the Saudi market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite build tool)
- **Routing**: Wouter (client-side, role-based access)
- **UI**: shadcn/ui (Radix UI primitives), Tailwind CSS (theming, Saudi-specific colors)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: Custom language provider (English/Arabic, RTL)

### Backend
- **Runtime**: Node.js with Express.js
- **Build**: ESBuild (production), tsx (development)
- **API**: RESTful
- **Authentication**: Replit OpenID Connect (OIDC)
- **Session Management**: Express sessions (PostgreSQL storage)

### Data Storage
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Schema Management**: Drizzle Kit

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Session Handling**: Server-side, httpOnly cookies
- **Role-Based Access**: Four roles (admin, organizer, attendee, service_provider) with route protection
- **User Management**: Automatic creation/updates via OIDC claims

### Core Features
- **Event Management**: CRUD operations, categorization, search
- **Registration**: Tracking, capacity management
- **Service Provider Marketplace**: Profiles, reviews, booking
- **Messaging**: Real-time communication
- **Review & Rating**: Bidirectional for events and providers
- **Admin Dashboard**: Oversight and management tools

## External Dependencies

### Database & Storage
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-kit`
- `connect-pg-simple`

### Authentication & Security
- `openid-client`
- `passport`
- `express-session`

### Frontend Libraries
- `@tanstack/react-query`
- `@hookform/resolvers`
- `wouter`
- `@radix-ui/*`
- `lucide-react`
- `date-fns`

### Development Tools
- `tsx`
- `esbuild`
- `@replit/vite-plugin-*`
- `tailwindcss`
- `postcss`

### Utility Libraries
- `clsx`
- `tailwind-merge`
- `class-variance-authority`
- `zod`
- `memoizee`

## Recent Updates (October 2025)

### Website Logo Added to Header (October 13, 2025)

**Implemented Custom Logo:**
Added the website logo image to the header, replacing the text-based logo for a more professional appearance.

**Implementation Details:**
- Logo image imported from attached assets using `@assets` alias
- Displayed in the Header component at 64px height with auto width
- Logo maintains aspect ratio using `object-contain`
- Logo is clickable and navigates to homepage
- Logo appears on all pages throughout the application
- Alt text set to "EventHub Logo" for accessibility

**Files Modified:**
- `client/src/components/Header.tsx`: Updated to display logo image

### Admin User Auto-Redirect to Admin Dashboard (October 13, 2025)

**Implemented Role-Based Login Redirect:**
Admin users are now automatically redirected to the admin dashboard upon login, providing direct access to administrative controls.

**Implementation Details:**

**Login Flow (`client/src/pages/Login.tsx`):**
- After successful login, the app fetches user data to check the role
- Admin users (role === 'admin') are redirected to `/admin`
- Non-admin users are redirected to `/` (regular dashboard)

**Root Path Handling (`client/src/components/RoleBasedHome.tsx`):**
- New component that intercepts root path access
- Checks authenticated user's role
- Redirects admin users to `/admin` automatically
- Shows regular dashboard for other users

**Routing Updates (`client/src/App.tsx`):**
- Root path (`/`) now uses `RoleBasedHome` component
- Admin users accessing root path are redirected to admin dashboard
- Non-admin users see regular dashboard as before

**Benefits:**
- Admin users get immediate access to admin controls after login
- Improved user experience with role-appropriate landing pages
- Maintains backward compatibility for non-admin users
- Consistent redirect behavior across login and direct URL access