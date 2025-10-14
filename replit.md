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
## Recent Changes

### Sponsor Logo Upload Functionality (October 14, 2025)

**Implemented Manual Logo Upload Feature:**
Added complete file upload functionality for sponsor logos in both admin dashboard and edit sponsor pages.

**Backend Implementation:**
- **File Upload Endpoint**: `POST /api/sponsors/upload-logo`
  - Accepts: Images (jpeg, jpg, png, gif, webp, svg)
  - Max Size: 5MB
  - Storage: `attached_assets/sponsor_logos/`
  - Returns: `{ logoUrl: "/assets/sponsor_logos/{filename}" }`
- **Multer Configuration**: Handles file uploads with validation and automatic directory creation
- **Static Serving**: Logos served via Express at `/assets/sponsor_logos/` path

**Frontend Implementation:**
- **Upload Button**: File picker for selecting and uploading logo images
- **Logo Preview**: Real-time preview of uploaded/selected logos
- **URL Input**: Alternative method to set logo via URL
- **Clear Logo**: Remove uploaded logo functionality
- **Loading States**: Visual feedback during upload process

**Translation Support:**
Added bilingual translations for upload functionality:
- English: "Upload Logo", "Uploading...", success/error messages
- Arabic: "رفع الشعار", "جاري الرفع...", success/error messages

**Files Modified:**
- `server/routes.ts`: Added file upload endpoint and multer configuration
- `client/src/pages/SponsorForm.tsx`: Implemented upload UI with preview
- `client/src/lib/i18n.ts`: Added upload-related translations (English/Arabic)
- `package.json`: Added multer and @types/multer dependencies

**Usage:**
1. Admin/sponsor navigates to sponsor form (create or edit)
2. Click "Upload Logo" button to select image file
3. Logo uploads automatically and preview displays
4. Save sponsor to persist logo URL in database
5. Logo displays on sponsors listing and detail pages

### Homepage Hero Section Update (October 14, 2025)

**Centralized Layout:**
Updated the homepage hero section to feature a centered, clean design:
- Removed the large hero image (previously showed Saudi Arabia cultural venue)
- Centralized all headers, titles, and buttons
- Changed from two-column grid layout to single centered column
- All text and CTAs now centered on all screen sizes

**Changes:**
- Removed heroImage import and img element
- Changed `text-center lg:text-left` to `text-center`
- Changed `justify-center lg:justify-start` to `justify-center`
- Removed grid layout classes (`lg:grid lg:grid-cols-2 lg:gap-12`)

**Visual Impact:**
- Cleaner, more focused hero section
- Better emphasis on call-to-action buttons
- Maintained gradient background and pattern overlay
- Bilingual support remains intact
