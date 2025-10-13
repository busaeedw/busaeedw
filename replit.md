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

## Recent Updates (October 2025)

### Admin CRUD Controls on Detail Pages (October 13, 2025)

**Event and Venue Detail Page Admin Controls:**
Successfully implemented comprehensive admin CRUD functionality on Event Details and Venue Details pages:

**Event Details Page (/events/:id):**
- Added Edit and Delete buttons for admin users in the hero section
- Edit button (data-testid="edit-event-button") navigates to /events/:id/edit page
- Delete button (data-testid="delete-event-button") opens confirmation dialog
- Buttons positioned after event badges with responsive layout
- Only visible when authenticated user has role === 'admin'

**Venue Details Page (/venues/:id):**
- Added Edit and Delete buttons for admin users in the header section
- Edit button (data-testid="edit-venue-button") navigates to /venues/:id/edit page
- Delete button (data-testid="delete-venue-button") opens confirmation dialog
- Buttons positioned next to venue badge with flex column layout
- Only visible when authenticated user has role === 'admin'

**Delete Confirmation Flow:**
- AlertDialog component displays confirmation message with item name
- Cancel button closes dialog without executing deletion
- Delete button confirms and executes deletion via API (DELETE /api/events/:id or DELETE /api/venues/:id)
- After successful deletion, user is redirected to respective browse page (/browse/events or /browse/venues)
- Success/error toast notifications display operation results
- Bilingual support for all dialog text and messages

**Technical Implementation:**
- Added useState for dialog state management
- Implemented delete mutation using TanStack Query with proper error handling
- Used useLocation hook for programmatic navigation after deletion
- Integrated AlertDialog from shadcn/ui for consistent UX
- Added Pencil and Trash2 icons from lucide-react
- All admin controls follow existing authorization pattern (user?.role === 'admin')

**Authorization:**
- Admin controls only visible to authenticated admin users
- Backend API validates admin role before allowing delete operations
- Non-admin users see no Edit/Delete buttons on detail pages
- Tested and verified admin authorization works correctly

### Service Provider Dashboard Updates (October 12, 2025)

**Logout Error Fix (October 12, 2025):**
- Fixed issue where users saw "Unauthorized" error toast after logging out
- Implemented localStorage flag to track intentional logout actions (persists across OIDC redirects)
- All protected pages now check for logout flag before showing unauthorized errors
- Users now experience smooth logout flow with only success message, no error toasts
- Updated from sessionStorage to localStorage to handle external OIDC provider navigation

**UI Simplification and Bilingual Support (October 11, 2025):**
Successfully implemented complete bilingual support and streamlined UI for the service provider dashboard:

**UI Simplification:**
- Removed three metric cards from top of dashboard (Weekly Engagements count, Available Events count, Messages count)
- Streamlined dashboard to focus on actionable content with two main sections:
  - "This Week's Engagements" - List view of confirmed bookings with event details
  - "Upcoming Events to Apply For" - List view of available events to apply for
- Cleaner, more focused interface for service providers

**Service Provider Dashboard Translations:**
- Added comprehensive Arabic translations for all service provider dashboard text
- Translations include: weekly engagements, available events, booking confirmations, and navigation elements
- All section headings and empty state messages fully support Arabic/English switching
- Proper RTL layout implementation for Arabic language display

**Authentication Role Preservation Fix:**
- Fixed critical bug where service provider roles were being overwritten to 'attendee' on OIDC login
- Updated `upsertUser()` function to preserve existing user roles from database
- Pattern matching for role detection now only applies to new users
- Existing service providers maintain their role across login sessions

**Translation Keys Added:**
- `dashboard.serviceProvider.weeklyEngagements`: "This Week's Engagements" / "عقود هذا الأسبوع"
- `dashboard.serviceProvider.upcomingEventsToApply`: "Upcoming Events to Apply For" / "الفعاليات القادمة للتقديم عليها"
- `dashboard.serviceProvider.noEngagements`: "No engagements this week" / "لا توجد عقود هذا الأسبوع"
- `dashboard.serviceProvider.browseEvents`: "Browse Events" / "تصفح الفعاليات"
- And additional service provider-specific translation keys

**Technical Implementation:**
- All hardcoded English text replaced with `t()` translation function calls
- Language preference persists across page navigations via localStorage
- Dashboard correctly renders role-specific content based on authenticated user role
- End-to-end testing confirms Arabic display and RTL layout functionality

## Recent Updates (September 2025)

### Complete Bilingual Error Handling Implementation (September 22, 2025)
Successfully implemented comprehensive bilingual error handling throughout the application:

**Logout Error Message Localization:**
- Fixed hardcoded English unauthorized error messages across all protected components
- Updated AdminDashboard, EventDetails, EventCreate, and Messages components to use translation functions
- Replaced hardcoded "Unauthorized" and "You are logged out. Logging in again..." with `t('common.unauthorized')` and `t('common.unauthorized.desc')`

**Route Protection Enhancement:**
- Fixed routing issue where `/admin` and `/messages` routes were inaccessible to unauthenticated users (resulting in 404 errors)
- Moved protected routes from authenticated-only conditional to public section, allowing components' own authentication logic to handle unauthorized access
- Enables proper unauthorized error handling and toast notifications before login redirection

**Language Persistence Implementation:**
- Implemented localStorage-based language preference persistence to maintain user language choice across page navigations
- Fixed language state reset issue during logout redirects (`window.location.href` navigation)
- Enhanced LanguageProvider to load and save language preference, ensuring consistent bilingual experience
- Added language dependency management in useEffect hooks to prevent stale translation state

**Technical Achievements:**
- Comprehensive bilingual support for all unauthorized error scenarios
- Consistent error messaging in both English and Arabic throughout the application
- Robust language persistence across authentication flows and page redirects
- Enhanced user experience with proper localization during logout/unauthorized scenarios

### Major Venues Database Expansion Completed
Successfully expanded venues database from 35 to 101 real Jeddah venues, exceeding the 100+ target:

**Final Results:**
- **101 total venues** across 10 different venue types
- **26 wedding halls** with themed designs (Diamond, Ruby Rose, Golden Palace, etc.)
- **23 hotels** ranging from luxury (Ritz-Carlton, Park Hyatt) to budget-friendly (OYO, Ibis)
- **10 convention centers** including universities, hospitals, and business centers
- **10 restaurants** with private dining and event spaces
- **8 cultural centers** including art museums and heritage foundations
- **7 entertainment venues** with family activities and theme parks
- **6 malls** with event plazas and community spaces
- **6 outdoor venues** including waterfront parks and marina spaces
- **3 community centers** and **2 sports centers**

All venues include authentic business data: names in English/Arabic, realistic SAR pricing, detailed amenities, contact information, and high-quality venue descriptions. The comprehensive seeding process uses batch insertion with progress tracking for reliable database population.

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