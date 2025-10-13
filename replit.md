# EventHub Saudi Arabia - Event Management Platform

## Overview
EventHub is a comprehensive event management platform for Saudi Arabia, acting as a digital marketplace connecting event organizers, attendees, service providers, and sponsors. It facilitates event creation, discovery, and management, alongside bookings for services like catering and photography, and event sponsorships. The platform supports multiple user roles (admin, organizer, attendee, service_provider, sponsor), offers bilingual support (English/Arabic) with RTL layout, and is built as a full-stack web application tailored for the Saudi market.

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
- **Role-Based Access**: Five roles (admin, organizer, attendee, service_provider, sponsor) with route protection
- **User Management**: Automatic creation/updates via OIDC claims

### Core Features
- **Event Management**: CRUD operations, categorization, search
- **Registration**: Tracking, capacity management
- **Service Provider Marketplace**: Profiles, reviews, booking
- **Sponsorship Management**: Sponsor profiles, event-sponsor associations
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

### Color Theme Updated to Match Saudi Events Website (October 13, 2025)

**Implemented Official Saudi Events Color Palette:**
Updated the entire application color theme to match the official Saudi events website (saudievents.sa) for consistent branding and visual identity.

**New Color Palette:**
- **Primary (Olive)**: `hsl(72 74% 27%)` - #667912 - Main brand color
- **Secondary (Coral)**: `hsl(16 82% 61%)` - #fc743c - Accent buttons and highlights
- **Accent (Gold)**: `hsl(46 74% 70%)` - #fad46b - Secondary accents and highlights
- **Olive Light**: `hsl(75 36% 55%)` - #a3b368 - Used for primary in dark mode
- **Mauve**: `hsl(350 27% 78%)` - #d7b9bd - Chart color

**Implementation Details:**
- Updated CSS custom properties in `client/src/index.css` for both light and dark modes
- Updated Tailwind config color definitions in `tailwind.config.ts`
- Added new color utility classes: `coral`, `olive` with variants
- Dark mode uses complementary colors from the same palette with adjusted saturation/lightness
- All UI components automatically inherit the new color scheme through CSS variables

**Files Modified:**
- `client/src/index.css`: Updated CSS variables for light and dark themes
- `tailwind.config.ts`: Added coral, olive, and updated gold color variants

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

### Event Sponsorship System (October 13, 2025)

**Implemented Complete Event Sponsorship Feature:**
Added a comprehensive sponsorship system to connect sponsors with events, enabling event organizers to showcase their sponsors and sponsors to increase brand visibility.

**Database Schema:**
- **sponsors table**: Stores sponsor information with bilingual support (name/nameAr, description/descriptionAr)
  - Fields: id, name, nameAr, logoUrl, website, contactEmail, contactPhone, description, descriptionAr, city, isFeatured, userId
  - Optional userId link allows sponsors with "sponsor" role to manage their own profiles
- **eventSponsors table**: Many-to-many junction table linking events to sponsors
  - Fields: eventId, sponsorId (composite primary key)
- **sponsor role**: New user role added to system for sponsor account management

**Authorization & Access Control:**
- Admins can create/edit/delete any sponsor
- Users with "sponsor" role can create/edit their own sponsor profiles
- Organizers can attach/detach sponsors to their events
- All users (including unauthenticated) can view sponsor listings and details

**Frontend Features:**
- **Sponsor List Page** (`/sponsors`): Browse all sponsors with search and city filter
- **Sponsor Details Page** (`/sponsors/:id`): Public view of sponsor information with logo, website, contact details
- **Sponsor Form** (`/sponsors/create`, `/sponsors/:id/edit`): Create/edit sponsor profiles (admin/sponsor only)
- Query structure uses TanStack Query with structured keys for proper cache invalidation

**API Endpoints:**
- `GET /api/sponsors` - List sponsors with optional search and city filters
- `GET /api/sponsors/:id` - Get sponsor details
- `POST /api/sponsors` - Create sponsor (admin/sponsor only)
- `PATCH /api/sponsors/:id` - Update sponsor (admin/sponsor only)
- `DELETE /api/sponsors/:id` - Delete sponsor (admin only)

**Files Modified:**
- `shared/schema.ts`: Added sponsors and eventSponsors tables with relations
- `server/storage.ts`: Added sponsor CRUD operations to IStorage interface
- `server/routes.ts`: Added sponsor API endpoints with proper authorization
- `client/src/pages/Sponsors.tsx`: Sponsor listing with search/filter
- `client/src/pages/SponsorForm.tsx`: Sponsor create/edit form
- `client/src/pages/SponsorDetails.tsx`: Public sponsor details view
- `client/src/App.tsx`: Added sponsor routes

**Future Enhancements:**
- Event creation/editing UI for attaching sponsors
- Display sponsors on event detail pages with logos
- Complete internationalization (sponsor translations in i18n)