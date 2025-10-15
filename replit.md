# EventHub Saudi Arabia - Event Management Platform

## Overview
EventHub is a comprehensive event management platform tailored for the Saudi Arabian market, functioning as a digital marketplace. It connects event organizers, attendees, service providers, and sponsors, facilitating event creation, discovery, management, service bookings (e.g., catering, photography), and sponsorships. The platform supports multiple user roles (admin, organizer, attendee, service_provider, sponsor), offers bilingual support (English/Arabic) with RTL layout, and is built as a full-stack web application.

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
-   **Service Provider Marketplace**: Profiles, reviews, booking, city-based filtering.
-   **Sponsorship Management**: Dedicated pages for listing and details, bilingual support.
-   **User Roles**: Five distinct roles (admin, organizer, attendee, service_provider, sponsor) with role-based access control and route protection.
-   **Admin Dashboard**: Comprehensive oversight and management tools.
-   **Review & Rating**: Bidirectional for events and providers.
-   **Organizer "My Events" Page**: Dedicated page for organizers to view and manage their created events in a card grid layout, including status badges and quick actions.

### System Design Choices
-   **Robust Authentication**: Leverages Replit Auth (OIDC) with server-side session handling and httpOnly cookies. Includes multi-tier role claim handling and automatic user creation/updates.
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
-   `multer` (for file uploads)

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
## Recent Updates

### My Events Page for Organizers (October 15, 2025)

**Feature Overview:**
Organizers now have a dedicated "My Events" page to view and manage all their created events (both published and draft) in a visual card grid layout.

**Implementation Details:**
- **Route**: `/organizer/my-events` - Protected route for authenticated users
- **Data Source**: Uses `/api/user/events` endpoint that filters events by organizer ID
- **Event Display**: Card grid layout showing event image, title, description, category, price, date, location, and status
- **Status Badges**: Clearly indicates whether events are "published" or "draft"
- **Actions**: View and Edit buttons on each event card

**Dashboard Integration:**
- Added clickable hyperlink under the event count in organizer dashboard card
- Link text: "Total events created" with hover underline effect (data-testid="link-view-my-events")
- Provides quick navigation to My Events page

**Backend Enhancement:**
- Modified `storage.getEvents()` to show ALL events (published and draft) when filtering by organizerId
- Public event listings (without organizerId) still only show published events for privacy
- Ensures organizers can view and manage all their events regardless of status

**Frontend Optimization:**
- Removed unnecessary role check from MyEvents page query for better reliability
- Query now enabled based on authentication status only
- Improved compatibility with different authentication methods (OIDC, local login)

**Bilingual Support:**
Complete translations added for My Events page:
- English: "My Events", "Manage and track all your created events", view/edit actions, empty state
- Arabic: "فعالياتي", "إدارة وتتبع جميع الفعاليات التي أنشأتها", view/edit actions, empty state

**Files Modified:**
- `client/src/pages/MyEvents.tsx`: New page component with card grid layout
- `client/src/App.tsx`: Added route for `/organizer/my-events`
- `client/src/pages/Dashboard.tsx`: Added hyperlink under event count to My Events
- `client/src/lib/i18n.ts`: Added myEvents translations (English and Arabic)
- `server/storage.ts`: Modified getEvents to include draft events for organizers

**User Flow:**
1. Organizer logs in and navigates to dashboard
2. Sees event count with clickable link "Total events created"
3. Clicks link to navigate to My Events page
4. Views all their events (published and draft) in card grid
5. Can click View to see event details or Edit to modify event
6. Empty state displays if no events exist with "Create Your First Event" button

**Testing Results:**
- ✅ OIDC login creates organizer users correctly
- ✅ My Events page displays both published and draft events
- ✅ Navigation from dashboard link works properly
- ✅ Status badges show correctly (published/draft)
- ✅ Event count in dashboard matches actual events
- ✅ Event creation flow from empty state works
