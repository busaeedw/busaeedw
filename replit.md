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

### Event Sponsor Selection Bug Fix (October 14, 2025)

**Issue:**
When organizers tried to create or edit events, they encountered a Radix UI error: "A <Select.Item /> must have a value prop that is not an empty string."

**Root Cause:**
- Sponsor selection dropdowns used `<SelectItem value="">` for the "None" option, which Radix UI prohibits
- Form defaults used empty strings for sponsor fields instead of undefined/null
- Form submission didn't properly handle clearing sponsors (undefined values were dropped from JSON payload)

**Solution Implemented:**
1. **Select Components:** Changed "None" option to use value="none" (sentinel value) instead of empty string
2. **Value Handling:** When "none" is selected, the onValueChange handler converts it to undefined in form state
3. **Form Defaults:** EventCreate now initializes sponsor fields as undefined instead of empty strings
4. **API Submission:** Both EventCreate and EventEdit mutations explicitly convert undefined sponsor values to null before JSON.stringify, ensuring null values are included in the API payload

**Technical Details:**
- EventCreate.tsx: Form defaults use `sponsor1Id: undefined` instead of `sponsor1Id: ''`
- Both forms: Select value prop uses `field.value || 'none'` to display "None" when empty
- Both forms: onValueChange converts "none" to undefined via `value === 'none' ? undefined : value`
- Mutations: Explicitly set `sponsor1Id: data.sponsor1Id || null` to include null in JSON payload

**User Experience:**
- Users can now select up to 3 sponsors when creating/editing events
- Users can clear sponsor selections by choosing "None" 
- Optional sponsors properly save as null in the database
- No Radix UI errors displayed

**Files Modified:**
- `client/src/pages/EventCreate.tsx`: Fixed form defaults and Select components
- `client/src/pages/EventEdit.tsx`: Fixed Select components and PATCH mutation

### Service Provider Selection Feature (October 15, 2025)

**Implemented Service Provider Association for Events:**
Organizers can now select up to 3 service providers when creating or editing events, similar to sponsor selection.

**Database Schema Changes:**
- Added three nullable foreign key columns to events table:
  - `service_provider_1_id` → references service_providers table
  - `service_provider_2_id` → references service_providers table
  - `service_provider_3_id` → references service_providers table
- All service provider associations are optional (nullable)

**Frontend Implementation:**
- **EventCreate Page**: Added 3 service provider selection dropdowns
- **EventEdit Page**: Added 3 service provider selection dropdowns with pre-population
- **Dropdown Logic**: Uses "none" sentinel value that converts to undefined in form state and null in API payload
- **Data Fetching**: Service providers loaded from `/api/service-providers` endpoint
- **Form Validation**: Uses same undefined → null conversion pattern as sponsor selection

**Backend Implementation:**
- **Auto-Create Organizer**: Fixed organizer record creation bug
  - When user with 'organizer' role creates first event, system auto-creates organizer record
  - Uses raw `db.insert(organizers).values({ id: userId, ...userData })` to set custom ID
  - Prevents foreign key constraint violations
- **Event Endpoints**: Support serviceProvider1Id, serviceProvider2Id, serviceProvider3Id in POST/PATCH

**Authentication Enhancements:**
- **OIDC Role Assignment**: Enhanced role claim handling in `upsertUser` function
  - Priority 1: `roles` array claim (used by test harness)
  - Priority 2: `role` string claim
  - Priority 3: ID pattern matching ("org-" → organizer, "sp-" → service_provider, etc.)
- **Login UI**: Added "Sign in with Replit" button to trigger OIDC flow
  - Divider with "or" text separates local and OIDC login options
  - Button redirects to `/api/login` endpoint
  - Enables test automation with OIDC bypass

**Bilingual Support:**
Added translations for service provider selection:
- English: "Service Provider 1/2/3", "Select service provider", "None"
- Arabic: "مزود الخدمة 1/2/3", "اختر مزود الخدمة", "بدون"

**Files Modified:**
- `shared/schema.ts`: Added service provider FK columns to events table
- `client/src/pages/EventCreate.tsx`: Added service provider dropdowns with undefined → null handling
- `client/src/pages/EventEdit.tsx`: Added service provider dropdowns with undefined → null handling
- `client/src/lib/i18n.ts`: Added service provider selection translations
- `server/routes.ts`: 
  - Added organizer auto-creation logic with custom ID
  - Imported `db` and `organizers` for raw insert
- `server/replitAuth.ts`: Enhanced `upsertUser` with multi-tier role claim handling
- `client/src/pages/Login.tsx`: Added OIDC login button with data-testid="button-oidc-login"

**Usage:**
1. Organizer navigates to create/edit event page
2. Fills in required event fields
3. Optionally selects up to 3 service providers from dropdowns
4. Saves event - service provider associations persist in database
5. Service providers display on event detail pages

**Testing:**
- Verified end-to-end with Playwright test
- OIDC authentication with role claims working correctly
- Service provider selection persists to database
- Auto-creation of organizer records prevents FK violations
