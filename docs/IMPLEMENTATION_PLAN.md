# bouture.com — MVP Implementation Plan

**Derived from:** [docs/PRD.md](PRD.md)
**Timeline:** 10 weeks (Phase 1 / MVP)
**Target:** ~30 granular steps, each completable in a single prompt session

---

## Table of Contents

- [Week 1 — Project Foundation](#week-1--project-foundation)
  - Step 1: Scaffold Next.js project
  - Step 2: Configure Tailwind CSS + Design tokens
  - Step 3: Initialize Supabase project and local dev
  - Step 4: Database schema migration (all tables, indexes, RLS, functions)
  - Step 5: PWA manifest, icons, and Serwist service worker shell
- [Week 2 — Authentication & Onboarding](#week-2--authentication--onboarding)
  - Step 6: Supabase Auth client/server helpers + middleware
  - Step 7: Sign up and Sign in pages
  - Step 8: Email verification, password reset, auth callback
  - Step 9: Onboarding wizard (username, avatar, address)
- [Week 3 — Map Core](#week-3--map-core)
  - Step 10: Map component with MapTiler/Mapbox GL JS
  - Step 11: PostGIS RPC integration and viewport-based fetching
  - Step 12: Custom map pins and marker clustering
- [Week 4 — Map UX](#week-4--map-ux)
  - Step 13: Search/location bar with geocoding autocomplete
  - Step 14: Filter bottom sheet (species, size, distance)
  - Step 15: Listing bottom sheet with photo carousel
  - Step 16: "Contacter le donneur" CTA + conversation creation
- [Week 5 — Add Cutting Form](#week-5--add-cutting-form)
  - Step 17: Species autocomplete component + seed data
  - Step 18: Listing form (size selector, description, address override)
  - Step 19: Photo upload pipeline (compress, upload, progress)
- [Week 6 — Listing Lifecycle](#week-6--listing-lifecycle)
  - Step 20: Preview, publish flow, redirect to map
  - Step 21: Listing detail page (SSR for SEO) + edit/delete
- [Week 7 — Messaging Core](#week-7--messaging-core)
  - Step 22: Conversations list page with real-time updates
  - Step 23: Chat interface — text messaging with Supabase Realtime
  - Step 24: Message status indicators (sent, delivered, read)
- [Week 8 — Messaging Polish](#week-8--messaging-polish)
  - Step 25: Photo messages in chat
  - Step 26: Typing indicators + online status (Presence)
  - Step 27: Push notifications for new messages (Edge Function + Web Push)
- [Week 9 — Profile & Social](#week-9--profile--social)
  - Step 28: Profile dashboard + edit profile
  - Step 29: Address management page with geocoding map
  - Step 30: Plant library (gallery, add, detail, "Proposer en don")
  - Step 31: Followers / following system + public profile
- [Week 10 — PWA Polish & Launch Prep](#week-10--pwa-polish--launch-prep)
  - Step 32: Offline caching strategies + background sync
  - Step 33: Loading skeletons, empty states, error boundaries
  - Step 34: Install prompt, Dockerfile, CI/CD pipeline
  - Step 35: Cross-browser testing + Lighthouse audit

---

## Week 1 — Project Foundation

### Step 1: Scaffold Next.js project

> PRD ref: Section 6.2 (Tech Stack), Section 6.4 (App Router Structure)

**Terminal commands:**

```bash
cd /Users/Antonin/development/Bouture
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

When prompted, accept defaults: TypeScript = Yes, ESLint = Yes, Tailwind = Yes, `src/` directory = Yes, App Router = Yes, import alias = `@/*`.

**Post-scaffold cleanup and base dependencies:**

```bash
pnpm add @supabase/supabase-js @supabase/ssr zustand framer-motion lucide-react
pnpm add @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-slot
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D supabase @types/node
```

| Dependency | Purpose | PRD ref |
|---|---|---|
| `@supabase/supabase-js` | Supabase client SDK | 6.2 |
| `@supabase/ssr` | Server-side Supabase helpers for Next.js | 6.2 |
| `zustand` | Lightweight client state management | 6.2 |
| `framer-motion` | Spring physics animations, bottom sheets, gestures | 6.2, 5.8 |
| `lucide-react` | Line icon library | 5.6 |
| `@radix-ui/react-dialog` | Accessible modal/dialog primitive | 6.2 |
| `@radix-ui/react-popover` | Popover/dropdown primitive | 6.2 |
| `@radix-ui/react-slot` | Slot utility for composable components | 6.2 |
| `react-hook-form` | Performant form handling | 6.2 |
| `@hookform/resolvers` | Zod resolver for react-hook-form | 6.2 |
| `zod` | Schema validation | 6.2 |
| `supabase` (dev) | Supabase CLI for local dev, migrations, type gen | 6.2 |

**Files to create:**

- [x] Clean up boilerplate: remove default `src/app/page.tsx` content, `globals.css` defaults
- [x] Create the skeleton directory structure from PRD Section 6.4:
  - `src/components/ui/`
  - `src/components/map/`
  - `src/components/chat/`
  - `src/components/listing/`
  - `src/components/profile/`
  - `src/components/layout/`
  - `src/lib/supabase/`
  - `src/lib/hooks/`
  - `src/lib/stores/`
  - `src/lib/utils/`
  - `src/lib/types/`
- [x] Create placeholder `src/app/page.tsx` that redirects to `/carte`
- [x] Create placeholder route directories with empty `page.tsx` for each route in PRD Section 3.4 (carte, donner, messages, profil, auth/login, auth/signup, auth/reset, auth/onboarding, u/[username])
- [x] Create `.env.local` with placeholder Supabase env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_MAPTILER_KEY`

**Checklist:**

- [x] `pnpm dev` starts without errors on `localhost:3000`
- [x] TypeScript compiles with no errors (`pnpm tsc --noEmit`)
- [x] All route directories exist and have placeholder pages
- [x] `.env.local` is created and added to `.gitignore`

---

### Step 2: Configure Tailwind CSS + Design tokens

> PRD ref: Section 5.2 (Color Palette), 5.3 (Typography), 5.4 (Spacing), 5.5 (Components), 5.9 (Breakpoints)

**Terminal commands:**

```bash
pnpm add @fontsource-variable/fraunces @fontsource-variable/dm-sans
```

| Dependency | Purpose |
|---|---|
| `@fontsource-variable/fraunces` | Display/heading font (self-hosted) |
| `@fontsource-variable/dm-sans` | Body font (self-hosted) |

**Files to create/modify:**

- [ ] `src/app/globals.css` — Define CSS custom properties for the complete design token system from PRD Section 5.2–5.4:
  - All color tokens (`--color-primary`, `--color-secondary`, `--color-accent`, etc.)
  - Typography tokens (`--font-display`, `--font-heading`, `--font-body`, etc.)
  - Spacing scale (4px base unit)
  - Border radius tokens (12px buttons, 16px cards, 20px sheets/pills)
  - Shadow tokens
- [ ] `tailwind.config.ts` — Extend Tailwind theme to consume the CSS variables:
  - `colors`: map all PRD colors to `var(--color-*)` references
  - `fontFamily`: Fraunces for display/heading, DM Sans for body
  - `borderRadius`: add `btn` (12px), `card` (16px), `sheet` (20px), `pill` (20px)
  - `screens`: match PRD Section 5.9 breakpoints (sm: 640px, md: 768px, lg: 1024px)
- [ ] `src/app/layout.tsx` — Import font CSS files, set `<html>` class with font-family variables

**Checklist:**

- [ ] CSS custom properties are accessible globally
- [ ] Tailwind utility classes like `bg-primary`, `text-accent`, `rounded-card` work
- [ ] Fraunces and DM Sans fonts load correctly in the browser
- [ ] No flash of unstyled text (FOUT) thanks to self-hosted fonts

---

### Step 3: Initialize Supabase project and local dev

> PRD ref: Section 6.2 (Backend), Section 9.3 (Environments)

**Terminal commands:**

```bash
pnpm supabase init
pnpm supabase start
```

This starts a local Supabase stack (Postgres, Auth, Storage, Realtime, Edge Functions) via Docker.

After `supabase start` completes, it outputs the local URL and anon key. Copy these into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<output from supabase start>
```

**Files to create:**

- [x] `src/lib/supabase/client.ts` — Browser-side Supabase client factory using `createBrowserClient` from `@supabase/ssr`
- [x] `src/lib/supabase/server.ts` — Server-side Supabase client factory using `createServerClient` from `@supabase/ssr` (for RSC and Route Handlers)
- [x] `src/lib/supabase/middleware.ts` — Auth middleware helper for refreshing sessions (used by `middleware.ts`)
- [x] `src/middleware.ts` (root) — Next.js middleware that calls the Supabase middleware helper to refresh JWT on every request, and protects routes that require auth (`/donner`, `/messages`, `/profil`)
- [x] Verify `supabase/config.toml` exists and is properly configured

**Checklist:**

- [ ] `supabase start` runs successfully (Docker required)
- [ ] Local Supabase Studio is accessible at `http://127.0.0.1:54323`
- [ ] Supabase client can connect from the Next.js app (test with a simple query)
- [x] Middleware intercepts requests and refreshes sessions

---

### Step 4: Database schema migration

> PRD ref: Appendix A (complete SQL schema — enums, extensions, tables, indexes, RLS, functions, triggers, Realtime config)

**Terminal commands:**

```bash
pnpm supabase migration new init_schema
```

This creates a timestamped migration file in `supabase/migrations/`.

**Files to create/modify:**

- [x] `supabase/migrations/<timestamp>_init_schema.sql` — Paste the COMPLETE SQL schema from PRD Appendix A, in this order:
  1. Extensions: `postgis`, `uuid-ossp`, `pg_trgm`
  2. Enums: `listing_size`, `message_type`, `message_status`, `plant_status`
  3. Tables: `profiles`, `species`, `plant_library`, `listings`, `conversations`, `messages`, `follows`, `push_subscriptions` (respect FK order — `plant_library` before `listings` due to `plant_library_id` FK)
  4. Indexes: all GIST, gin_trgm, and standard B-tree indexes
  5. RLS: enable RLS on all tables + all policies
  6. Functions/RPCs: `get_listings_in_bounds`, `get_or_create_conversation`, `get_user_conversations`
  7. Triggers: `update_updated_at` (on profiles, listings, plant_library), `on_new_message_update_conversation`, `sync_plant_status`
  8. Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations;`
- [x] `supabase/seed.sql` — Seed the `species` table with ~50 common plant species for development (Monstera deliciosa, Pothos, Ficus elastica, Aloe vera, etc.)

**Apply the migration:**

```bash
pnpm supabase db reset
```

This applies all migrations and seed data to the local Supabase Postgres instance.

**Generate TypeScript types:**

```bash
pnpm supabase gen types typescript --local > src/lib/types/database.types.ts
```

**Files created by codegen:**

- [x] `src/lib/types/database.types.ts` — TypeScript types matching the DB schema (manually written from schema; regenerate with `pnpm supabase gen types typescript --local > src/lib/types/database.types.ts` after `supabase start`)

**Checklist:**

- [ ] `supabase db reset` runs without SQL errors
- [ ] All 8 tables exist in Supabase Studio (`profiles`, `species`, `plant_library`, `listings`, `conversations`, `messages`, `follows`, `push_subscriptions`)
- [ ] PostGIS extension is active (`SELECT PostGIS_Version();` returns a result)
- [ ] RLS is enabled on all tables (verify in Studio → Authentication → Policies)
- [ ] RPC functions are callable via Supabase Studio SQL editor
- [x] `database.types.ts` is generated and contains types for all tables
- [ ] Seed species appear in the `species` table

---

### Step 5: PWA manifest, icons, and Serwist service worker shell

> PRD ref: Section 7.1.1 (Manifest), 7.1.2 (Service Worker), 7.1.4 (Install Prompt)

**Terminal commands:**

```bash
pnpm add @serwist/next
pnpm add -D serwist
```

| Dependency | Purpose |
|---|---|
| `@serwist/next` | Next.js integration for Serwist (service worker generation) |
| `serwist` (dev) | Core service worker library |

**Files to create/modify:**

- [ ] `public/manifest.json` — Web app manifest matching PRD Section 7.1.1 exactly:
  - `name`: "bouture.com — Echange de boutures"
  - `short_name`: "bouture"
  - `start_url`: "/carte"
  - `display`: "standalone"
  - `theme_color`: "#4A6741"
  - `background_color`: "#F5F0E8"
  - Icons: 192x192, 512x512, maskable 512x512
- [ ] `public/icons/` — Create placeholder PNG icons (192x192, 512x512, maskable). Use a solid green (#4A6741) square with a leaf shape as placeholder.
- [ ] `src/app/sw.ts` — Serwist service worker entry point with precache manifest injection and basic runtime caching strategies (cache-first for fonts/images, stale-while-revalidate for API)
- [ ] `next.config.ts` — Wrap with `withSerwist()` to enable service worker generation at build time
- [ ] `src/app/layout.tsx` — Add `<link rel="manifest" href="/manifest.json">` and meta tags for `theme-color`

**Checklist:**

- [ ] `manifest.json` is served at `/manifest.json`
- [ ] `next build` generates the service worker file
- [ ] Chrome DevTools → Application → Manifest shows valid PWA manifest
- [ ] Service worker registers successfully in dev (or after `next build && next start`)

---

## Week 2 — Authentication & Onboarding

### Step 6: Supabase Auth client/server helpers + middleware

> PRD ref: Section 4.1.2 (Auth Method), Section 6.2 (Auth row)

This step refines the Supabase client helpers created in Step 3 and adds proper auth flow utilities.

**Files to create/modify:**

- [ ] `src/lib/supabase/client.ts` — Finalize the browser client with `createBrowserClient` from `@supabase/ssr`. Export a singleton getter function.
- [ ] `src/lib/supabase/server.ts` — Finalize the server client using `createServerClient` from `@supabase/ssr` with cookie-based session management for RSC, Route Handlers, and Server Actions.
- [ ] `src/middleware.ts` — Finalize middleware:
  - Refresh session token on every request
  - Define protected routes: `/donner`, `/messages`, `/messages/*`, `/profil`, `/profil/*`
  - Redirect unauthenticated users to `/auth/login?returnTo=<current_path>`
  - Redirect authenticated users away from `/auth/login` and `/auth/signup` to `/carte`
- [ ] `src/lib/hooks/use-auth.ts` — Custom hook wrapping `supabase.auth.onAuthStateChange` for client components. Exposes `user`, `session`, `loading`, `signOut`.
- [ ] `src/lib/types/auth.ts` — Type definitions for auth state, user profile (merging Supabase `User` with `profiles` table data)

**Checklist:**

- [ ] Server-side client correctly reads session from cookies
- [ ] Middleware redirects unauthenticated users from protected routes
- [ ] Middleware redirects authenticated users from auth pages
- [ ] `use-auth` hook reactively updates on session changes

---

### Step 7: Sign up and Sign in pages

> PRD ref: Section 4.1.2 (Sign up, Sign in)

**Files to create/modify:**

- [x] `src/app/auth/login/page.tsx` — Sign in form:
  - Email input, password input, "Se connecter" button
  - Link to signup and password reset
  - Form validation with Zod (email format, password min 8 chars)
  - On success: redirect to `returnTo` param or `/carte`
  - Error handling: invalid credentials, unverified email
- [x] `src/app/auth/signup/page.tsx` — Sign up form:
  - Email input, password input (min 8 chars, 1 uppercase, 1 number per PRD), confirm password
  - Form validation with Zod
  - On success: show "Check your email for a verification link" screen
  - Error handling: email already registered
- [x] `src/app/auth/layout.tsx` — Auth layout (centered card, botanical illustration background, no bottom nav)
- [x] `src/components/ui/button.tsx` — Button component with Primary, Secondary, Outline, Ghost variants (PRD Section 5.5)
- [x] `src/components/ui/input.tsx` — Input component matching PRD Section 5.5 (backgrounds, borders, focus states)
- [x] `src/components/ui/card.tsx` — Card component (rounded-card, shadow, padding)

**Checklist:**

- [x] User can sign up with a valid email + password
- [ ] Verification email is sent (check local Supabase Inbucket at `localhost:54324`)
- [x] User can sign in with verified credentials
- [x] Form validation prevents submission of invalid data
- [x] UI matches design system (colors, typography, spacing, rounded corners)

---

### Step 8: Email verification, password reset, auth callback

> PRD ref: Section 4.1.2 (Email verification, Password reset)

**Files to create/modify:**

- [x] `src/app/auth/callback/route.ts` — Route Handler for Supabase auth callback. Handles the `code` exchange for email verification and password reset magic links. Redirects to `/auth/onboarding` (new user) or `/carte` (returning user).
- [x] `src/app/auth/reset/page.tsx` — Password reset flow:
  - Step 1: Enter email → `supabase.auth.resetPasswordForEmail()`
  - Step 2: "Check your email" confirmation screen
- [ ] `src/app/auth/update-password/page.tsx` — New password form (reached via reset link):
  - New password input + confirm
  - On success: redirect to `/carte` with success toast
- [x] `src/components/ui/toast.tsx` — Toast notification component (success, error, info variants). Uses Sonner with design-system styling.

**Checklist:**

- [ ] Clicking email verification link activates the account
- [x] Auth callback correctly exchanges code for session
- [x] Password reset email is sent and link works
- [ ] New password can be set successfully
- [x] Toast notifications appear and auto-dismiss

---

### Step 9: Onboarding wizard (username, avatar, address)

> PRD ref: Section 4.1.3 (Onboarding Flow)

**Terminal commands:**

```bash
pnpm add browser-image-compression
```

| Dependency | Purpose |
|---|---|
| `browser-image-compression` | Client-side image resize and compression for avatar upload |

**Files to create/modify:**

- [x] `src/app/auth/onboarding/page.tsx` — Multi-step onboarding wizard:
  - Step indicator (1/3 dots or progress bar)
  - Step 1: Welcome screen with illustration + "Commencer" CTA
  - Step 2: Username input (real-time uniqueness check, debounced 500ms) + avatar upload (circular crop area, compress to 400x400 WebP < 100KB using `browser-image-compression`, upload to Supabase Storage `avatars/{user_id}/`)
  - Step 3: Address input with geocoding autocomplete + mini-map preview (static image or simple map embed). Explanation text about privacy.
  - "Terminer" button: insert row into `profiles` table, redirect to `/carte`
- [x] `src/lib/utils/image-compression.ts` — Utility function wrapping `browser-image-compression` with preset options (maxWidthOrHeight, maxSizeMB, fileType, etc.)
- [ ] `src/lib/utils/geocoding.ts` — Utility for calling MapTiler Geocoding API: `searchAddress(query)` returns suggestions, `reverseGeocode(lat, lng)` returns address components
- [ ] `src/components/ui/avatar.tsx` — Avatar component (circular, with fallback initials)
- [ ] `src/components/ui/stepper.tsx` — Step indicator component (dots or bar)
- [ ] Add Supabase Storage bucket creation to the migration or document manual setup:
  - Bucket `avatars` (public read)

**Checklist:**

- [x] Onboarding only appears for new users (no `profiles` row yet)
- [x] Username uniqueness is validated with debounced DB query
- [x] Avatar is compressed client-side and uploaded to `avatars/` bucket
- [ ] Geocoding autocomplete returns address suggestions
- [x] Profile row is created with username, avatar_url, address fields
- [x] User is redirected to `/carte` after completing onboarding

---

## Week 3 — Map Core

### Step 10: Map component with MapTiler/Mapbox GL JS

> PRD ref: Section 4.2.5 (Map Canvas), Section 6.2 (Maps row)

**Terminal commands:**

```bash
pnpm add maplibre-gl @maplibre/maplibre-gl-geocoder
```

| Dependency | Purpose |
|---|---|
| `maplibre-gl` | Open-source WebGL map rendering (compatible with MapTiler styles) |
| `@maplibre/maplibre-gl-geocoder` | Geocoder control for the search bar (optional, may use custom) |

Alternative if using Mapbox:
```bash
pnpm add react-map-gl mapbox-gl
```

Choose **one** provider. MapLibre + MapTiler is recommended for cost and openness.

**Files to create/modify:**

- [x] `src/components/map/map-view.tsx` — Main map component (`"use client"`):
  - Initialize MapLibre GL JS with MapTiler style URL (`https://api.maptiler.com/maps/streets-v2/style.json?key=...`)
  - Custom nature-themed map style (or use MapTiler's "topo" or "outdoor" base and override colors)
  - Default center: user's geolocation (via `navigator.geolocation`) or Paris fallback (48.8566, 2.3522)
  - Default zoom: 13
  - Zoom +/- controls (bottom-right)
  - Geolocation control (re-center button)
  - User location pulsing dot (via `GeolocateControl`)
  - Map occupies full viewport minus bottom nav height
- [x] `src/app/carte/page.tsx` — Map page, renders `<MapView />` as a client component
- [x] `src/components/layout/bottom-nav.tsx` — Bottom navigation bar:
  - 4 tabs: Carte, Donner, Messages, Profil (matching PRD Section 3.2)
  - Icons from Lucide: `MapPin`, `PlusCircle`, `MessageCircle`, `User`
  - Active tab highlight with `--color-primary`
  - Unread badge on Messages tab (placeholder for now)
- [x] `src/app/layout.tsx` — Update root layout to include `<BottomNav />` (visible on all pages except auth)
- [x] `src/lib/stores/map-store.ts` — Zustand store for map state:
  - `viewport` (center, zoom, bounds)
  - `selectedListingId`
  - `filters` (species, sizes, radius)

**Checklist:**

- [x] Map renders fullscreen on `/carte`
- [x] MapTiler tiles load correctly (requires valid API key in `.env.local`)
- [x] User geolocation works (permission prompt appears)
- [x] Bottom nav is visible and navigates between tabs
- [x] Map state is managed via Zustand store

---

### Step 11: PostGIS RPC integration and viewport-based fetching

> PRD ref: Section 4.2.6 (Viewport query, Data Fetching Strategy), Appendix A (`get_listings_in_bounds` RPC)

**Files to create/modify:**

- [x] `src/lib/supabase/queries/listings.ts` — Functions to call Supabase RPCs:
  - `getListingsInBounds(bounds, filters)` — calls `get_listings_in_bounds` RPC with north/south/east/west and optional filter params. Returns typed array of listings.
  - `getListingById(id)` — fetches a single listing with donor profile joined
- [x] `src/lib/hooks/use-listings-in-bounds.ts` — Custom hook that:
  - Subscribes to map `moveend` events (from Zustand store)
  - Debounces 300ms before calling `getListingsInBounds`
  - Returns `{ listings, isLoading, error }`
  - Re-fetches when filters change
- [x] `src/lib/types/listing.ts` — TypeScript interface for the listing shape returned by the RPC (id, donor_id, species_name, size, description, photos, lat, lng, address_city, donor_username, donor_avatar, created_at)
- [x] `src/components/map/map-view.tsx` — Integrate the hook:
  - On map `moveend`, extract viewport bounds (getNorthEast, getSouthWest)
  - Pass bounds + filters to `useListingsInBounds`
  - Pass resulting listings to the pin layer

**Checklist:**

- [x] RPC `get_listings_in_bounds` is callable from the client
- [x] Moving the map triggers a debounced data fetch
- [x] Listings data is returned in the expected shape
- [x] No excessive API calls (debounce prevents rapid-fire fetches)

---

### Step 12: Custom map pins and marker clustering

> PRD ref: Section 4.2.6 (Cutting Pins — icon, clustering, interaction, bounce animation)

**Terminal commands:**

```bash
pnpm add supercluster
pnpm add -D @types/supercluster
```

| Dependency | Purpose |
|---|---|
| `supercluster` | Fast geospatial point clustering for map markers |

**Files to create/modify:**

- [x] `src/components/map/map-pins.tsx` — Pin rendering layer:
  - Use `supercluster` to cluster listings at zoom < 14
  - Individual pins: custom SVG leaf/sprout icon (32x32, `--color-primary`), rendered as MapLibre `Marker` or custom layer
  - Cluster pins: circle with count label, gradient from green (few) to terracotta (many)
  - Tap on pin: set `selectedListingId` in Zustand store → opens bottom sheet (wired in Step 15)
  - Tap on cluster: zoom in to expand
  - Pin bounce-in animation on data load (400ms spring per PRD Section 5.8)
- [ ] `public/icons/pin-leaf.svg` — Custom SVG pin icon (leaf/sprout shape, 32x32)
- [x] `src/lib/utils/clustering.ts` — Wrapper around `supercluster` that accepts listings array and map viewport/zoom, returns clusters + individual points
- [x] `src/components/map/results-count.tsx` — Floating pill component showing "X boutures dans cette zone" (positioned above bottom sheet area)

**Checklist:**

- [x] Pins render at correct geographic positions for each listing
- [x] Clustering activates at zoom < 14 and shows accurate count
- [x] Tapping a pin sets the selected listing in store
- [x] Tapping a cluster zooms in
- [x] Pins animate in with a bounce
- [x] Results count pill shows correct count

---

## Week 4 — Map UX

### Step 13: Search/location bar with geocoding autocomplete

> PRD ref: Section 4.2.3 (Search / Location Bar, Geocoding Search Overlay)

**Files to create/modify:**

- [x] `src/components/map/search-bar.tsx` — Floating search bar component (top of map):
  - Pill-shaped location display (current city/postal code or searched area)
  - GPS icon button to re-center on user's geolocation
  - Tap on pill → opens geocoding search overlay
  - "Filtres" button (pill shape, right-aligned) — opens filter sheet (Step 14)
  - Frosted glass / semi-transparent white background
- [x] `src/components/map/geocoding-overlay.tsx` — Fullscreen search overlay:
  - Autofocus text input
  - As user types (debounced 300ms), call MapTiler Geocoding API via `src/lib/utils/geocoding.ts`
  - Show result list below input
  - Tap a result: center map on coordinates, close overlay, update search bar label
  - Recent searches stored in localStorage (max 5)
  - Close button / back arrow
- [x] `src/lib/stores/map-store.ts` — Add `searchLabel` and `searchCoords` to store

**Checklist:**

- [x] Search bar floats above the map with correct styling
- [x] Tapping the location pill opens the geocoding overlay
- [x] Typing returns geocoding results from MapTiler API
- [x] Selecting a result centers the map and closes the overlay
- [ ] GPS button re-centers the map on user's location
- [x] Recent searches are persisted in localStorage

---

### Step 14: Filter bottom sheet (species, size, distance)

> PRD ref: Section 4.2.4 (Filter Bottom Sheet)

**Files to create/modify:**

- [x] `src/components/ui/bottom-sheet.tsx` — Reusable bottom sheet component:
  - Drag handle (40x4px pill)
  - Snap points: closed, half-screen (default), full-screen
  - Drag-to-dismiss with spring physics (Framer Motion, stiffness: 300, damping: 30)
  - Semi-transparent backdrop (opacity 0.3), tappable to dismiss
  - Rounded top corners (20px)
- [x] `src/components/map/filter-sheet.tsx` — Filter content inside bottom sheet:
  - **Species filter:** autocomplete text input, selected species shown as removable chips. Queries `species` table with trigram search.
  - **Size filter:** multi-select chip group with all 8 options (Graine, Tubercule, XS, S, M, L, XL, XXL)
  - **Distance slider:** range input from 1–50 km, default 10 km, label shows current value
  - "Appliquer" button (Secondary style) → updates Zustand store filters → closes sheet → re-fetches listings
  - "Reinitialiser" button (Ghost style) → clears all filters
- [x] `src/components/ui/chip.tsx` — Chip/pill component (selected/unselected states, removable variant)
- [x] `src/components/ui/slider.tsx` — Range slider component
- [x] `src/components/map/search-bar.tsx` — Add badge indicator on "Filtres" button when filters are active (count of active filters)
- [x] `src/lib/stores/map-store.ts` — Add `activeFilterCount` derived state

**Checklist:**

- [x] Bottom sheet opens/closes with smooth spring animation
- [ ] Species autocomplete queries the DB and shows suggestions
- [x] Size chips allow multi-selection
- [x] Distance slider adjusts the radius value
- [x] "Appliquer" closes the sheet and triggers a new data fetch with filters
- [x] "Reinitialiser" clears all filters
- [x] Active filter badge shows on the Filtres button

---

### Step 15: Listing bottom sheet with photo carousel

> PRD ref: Section 4.2.7 (Bottom Sheet — Listing Detail), Section 5.5 (Cards, Carousel)

**Terminal commands:**

```bash
pnpm add embla-carousel-react
```

| Dependency | Purpose |
|---|---|
| `embla-carousel-react` | Lightweight, performant carousel/slider for photo galleries |

**Files to create/modify:**

- [x] `src/components/listing/listing-bottom-sheet.tsx` — Listing detail bottom sheet:
  - Triggered when a pin is tapped (reads `selectedListingId` from Zustand store)
  - **Peek state** (~40% viewport): photo carousel + key details + CTA
  - **Expanded state** (swipe up, ~85%): full details
  - **Dismissed** (swipe down): clears selected listing
  - Content layout matching PRD Section 4.2.7:
    - Photo carousel (edge-to-edge, 4:3 aspect, swipeable, pagination "1/5")
    - Species name (bold, large)
    - Size badge (colored chip)
    - Description snippet (2-line truncation)
    - Donor info (avatar 32px + username + join date)
    - "Contacter le donneur" button (full-width, terracotta accent)
- [x] `src/components/ui/carousel.tsx` — Reusable photo carousel wrapper around Embla:
  - Swipeable, lazy-loaded images
  - Pagination indicator (dots or "1/5" counter)
  - 4:3 aspect ratio container
  - Rounded top corners
- [x] `src/components/ui/badge.tsx` — Size badge component (colored pill for listing sizes)

**Checklist:**

- [x] Bottom sheet opens when a pin is tapped
- [x] Photo carousel is swipeable with pagination indicator
- [x] Listing details (species, size, description, donor) are displayed correctly
- [x] Swipe up expands to full detail; swipe down dismisses
- [x] "Contacter le donneur" button is visible and styled

---

### Step 16: "Contacter le donneur" CTA + conversation creation

> PRD ref: Section 4.2.7 ("Contacter le donneur" CTA Behavior), Appendix A (`get_or_create_conversation` RPC)

**Files to create/modify:**

- [ ] `src/lib/supabase/queries/conversations.ts` — Functions:
  - `getOrCreateConversation(otherUserId, listingId)` — calls `get_or_create_conversation` RPC
  - `sendMessage(conversationId, senderId, content, type)` — inserts a message into `messages` table
- [ ] `src/components/listing/contact-donor-button.tsx` — Contact CTA component:
  - If user is authenticated:
    1. Call `getOrCreateConversation(donor_id, listing_id)`
    2. If new conversation: auto-send first message "Bonjour ! Je suis interesse(e) par votre bouture de **[Species]** ([Size])."
    3. Navigate to `/messages/[conversationId]`
  - If user is not authenticated:
    - Redirect to `/auth/login?returnTo=/carte/[listingId]`
  - Loading state while creating conversation
- [x] `src/components/listing/listing-bottom-sheet.tsx` — Wire `<ContactDonorButton />` into the bottom sheet
  - Hide button if viewing own listing
  - Show "Modifier" / "Supprimer" instead for own listings

**Checklist:**

- [x] Tapping "Contacter" creates a conversation (or opens existing one)
- [x] Auto-generated first message includes species name and size
- [x] User is navigated to the chat page
- [ ] Unauthenticated users are redirected to login
- [ ] Own listings show edit/delete instead of contact button

---

## Week 5 — Add Cutting Form

### Step 17: Species autocomplete component + seed data

> PRD ref: Section 4.3.2 (Species field), Appendix C (Species Database Seed Strategy)

**Files to create/modify:**

- [ ] `supabase/seed.sql` — Expand the species seed to ~100–200 common houseplants and garden plants. Each entry: `common_name`, `scientific_name`, `family`. Include popular species: Monstera deliciosa, Pothos (Epipremnum aureum), Ficus elastica, Philodendron, Aloe vera, Sansevieria, Calathea, Tradescantia, Pilea peperomioides, Begonia, Ceropegia, Hoya, Alocasia, Syngonium, Chlorophytum, Zamioculcas, Dracaena, Dieffenbachia, Maranta, Peperomia, Crassula, Echeveria, Haworthia, Kalanchoe, Sedum, Lavandula, Rosmarinus, Mentha, Ocimum, Thymus, Salvia, Fragaria, Solanum lycopersicum, Capsicum, Cucumis, Rosa, Hydrangea, Hedera, etc.
- [x] `src/lib/supabase/queries/species.ts` — `searchSpecies(query)`: searches `species` table using `ILIKE` or trigram similarity, returns top 10 matches
- [x] `src/components/listing/species-autocomplete.tsx` — Autocomplete input component:
  - Text input with debounced search (200ms)
  - Dropdown of matching species (common_name + scientific_name in smaller text)
  - Selecting a species fills the input and stores `species_id` + `species_name`
  - If no match: show "Ajouter comme nouvelle espece" option, allow free-text entry
  - Integrates with React Hook Form via `Controller`

**Apply updated seed:**

```bash
pnpm supabase db reset
pnpm supabase gen types typescript --local > src/lib/types/database.types.ts
```

**Checklist:**

- [ ] Species seed contains 100+ entries
- [x] Autocomplete returns results within 200ms
- [x] Free-text entry is allowed when no match
- [x] Component integrates with React Hook Form

---

### Step 18: Listing form (size selector, description, address override)

> PRD ref: Section 4.3.2 (all form fields), Section 4.3.3 (Form Flow), Appendix B (Size definitions)

**Files to create/modify:**

- [x] `src/app/donner/page.tsx` — Add cutting form page:
  - React Hook Form + Zod schema validation
  - Fields in order:
    1. Species autocomplete (from Step 17)
    2. Size chip selector (single select): Graine, Tubercule, XS, S, M, L, XL, XXL
    3. Photos upload zone (Step 19 — placeholder for now)
    4. Description textarea (max 500 chars, character counter)
    5. Localisation: pre-filled from profile address, shown on mini-map (static), toggle "Utiliser une autre adresse" → geocoding input
  - "Apercu" (Preview) button at bottom → shows preview card (Step 20)
  - Form is scrollable, mobile-friendly
- [x] `src/components/listing/size-selector.tsx` — Horizontally scrollable chip group for size selection:
  - 8 options matching PRD Appendix B
  - Single select (radio-like behavior)
  - Selected chip uses `--color-primary` background, white text
  - Unselected chips use `--color-neutral-100` background
- [x] `src/components/listing/address-picker.tsx` — Address override component:
  - Shows current profile address with mini static map
  - Toggle switch "Utiliser une autre adresse"
  - When toggled: geocoding autocomplete input + mini-map updates
  - Uses `src/lib/utils/geocoding.ts` from Step 9
- [x] `src/lib/schemas/listing.ts` — Zod schema for listing validation:
  - `species_name`: string, min 1 char
  - `size`: enum matching `listing_size`
  - `photos`: array of File/URL, min 1, max 5
  - `description`: string, max 500, optional
  - `address_lat`: number
  - `address_lng`: number

**Checklist:**

- [x] Form renders all fields in correct order
- [x] Zod validation prevents empty species or missing size
- [x] Size selector allows only single selection
- [x] Character counter shows remaining chars for description
- [x] Address defaults to profile address
- [x] Address override toggle reveals geocoding input

---

### Step 19: Photo upload pipeline (compress, upload, progress)

> PRD ref: Section 4.3.2 (Photos field), ADR-4 (Client-side image compression)

**Files to create/modify:**

- [x] `src/components/listing/photo-upload.tsx` — Multi-photo upload component:
  - Grid of photo slots (max 5). First slot = "cover image" indicator.
  - Tap a slot → open native file picker (accept: JPEG, PNG, WebP, HEIC). Also allow camera on mobile.
  - After selection: show thumbnail preview immediately (via `URL.createObjectURL`)
  - Client-side processing pipeline using `browser-image-compression`:
    - Resize to max 1200px width
    - Convert to WebP format
    - Compress to < 300KB
    - Strip EXIF data
  - Show per-image compression loading indicator
  - Drag to reorder photos (native HTML drag-and-drop)
  - "X" button on each thumbnail to remove
  - Minimum 1 photo enforced by Zod schema
- [x] `src/lib/utils/image-compression.ts` — Refine the compression utility from Step 9:
  - `compressImage(file: File, options)` → returns compressed `File`
  - Default options: `{ maxWidthOrHeight: 1200, maxSizeMB: 0.3, fileType: 'image/webp', useWebWorker: true }`
- [x] `src/lib/supabase/storage.ts` — Storage helper functions:
  - `uploadListingPhoto(userId, listingId, file, index)` → uploads to `listings/{userId}/{listingId}/{uuid}.webp`, returns public URL
  - `uploadListingPhotos(userId, listingId, files)` → uploads all photos in parallel
  - `deleteListingPhotos(userId, listingId)` → removes all photos for a listing
- [ ] Add Storage bucket setup documentation or migration:
  - Bucket `listings` (public read, authenticated upload to own folder)
  - Bucket `plant-library` (public read, authenticated upload)
  - Bucket `chat-images` (authenticated read/write)

**Checklist:**

- [x] Photos can be selected from gallery or camera
- [x] Thumbnails appear immediately after selection
- [x] Compression reduces images to < 300KB WebP
- [x] Compression loading indicator shown per image
- [x] Photos can be reordered via drag
- [x] Photos can be removed
- [x] At least 1 photo is enforced

---

## Week 6 — Listing Lifecycle

### Step 20: Preview, publish flow, redirect to map

> PRD ref: Section 4.3.4 (Preview and Confirm), Section 4.3.5 (Post-Submit Behavior)

**Files to create/modify:**

- [x] `src/components/listing/listing-preview.tsx` — Preview card component:
  - Replicates the exact appearance of a listing in the map bottom sheet
  - Cover photo, species name, size badge, description snippet, donor info (current user)
  - Two actions: "Modifier" (back to form) and "Publier" (submit)
- [x] `src/app/donner/page.tsx` — Update to include preview step:
  - Form state → "Apercu" button → show `<ListingPreview />`
  - "Publier" button triggers the submit flow
- [x] `src/lib/supabase/mutations/listings.ts` — `createListing(data)` function:
  1. Generate a UUID for the listing
  2. Upload all photos in parallel to Supabase Storage → collect URLs
  3. Compute `location_public` by jittering the exact coordinates (~200m random offset seeded by listing ID)
  4. Insert row into `listings` table
  5. Return the created listing
- [x] `src/lib/utils/geo-jitter.ts` — `jitterCoordinates(lat, lng, seed)`: applies a deterministic ~200m random offset using a seeded PRNG (seed = listing UUID). Returns `{ lat, lng }`.
- [x] Update `src/app/donner/page.tsx` submit handler:
  - Show loading overlay during upload/insert
  - On success: redirect to `/carte?highlight=[listingId]` with map centered on listing
  - Show success toast: "Votre bouture est en ligne !"

**Checklist:**

- [x] Preview card accurately matches the bottom sheet listing appearance
- [x] "Publier" uploads photos and creates the listing
- [x] Location jittering applies a ~200m offset
- [x] User is redirected to the map with the new listing visible
- [x] Success toast appears

---

### Step 21: Listing detail page (SSR for SEO) + edit/delete

> PRD ref: Section 4.2.7 (Expanded State Content), Section 3.4 (`/carte/[listingId]`)

**Files to create/modify:**

- [x] `src/app/carte/[listingId]/page.tsx` — Server-rendered listing detail page:
  - Fetch listing data server-side (via Supabase server client)
  - Full photo gallery (all photos, vertical scroll)
  - Species name, size badge, full description
  - Donor info: avatar, username, join date
  - Approximate location label (city/arrondissement)
  - Listing age ("Il y a 3 jours") — computed from `created_at`
  - "Contacter le donneur" CTA (reuse `<ContactDonorButton />`)
  - "Signaler" (Report) text link (placeholder, Phase 2)
  - If own listing: "Modifier" and "Supprimer" buttons
  - Open Graph meta tags for social sharing (photo, species, location)
- [ ] `src/lib/supabase/mutations/listings.ts` — Add:
  - `updateListing(listingId, data)` — updates species, size, description, photos
  - `deactivateListing(listingId)` — sets `is_active = false`
  - ~~`deleteListing(listingId)` — deletes listing + removes Storage photos~~ (done via Server Action in `src/app/carte/[listingId]/actions.ts`)
- [ ] `src/app/donner/page.tsx` — Support edit mode:
  - Accept optional `?edit=[listingId]` query param
  - Pre-fill form with existing listing data
  - "Mettre a jour" button instead of "Publier"
- [x] `src/components/ui/confirm-dialog.tsx` — Confirmation dialog (Radix Dialog) for destructive actions (delete listing)
- [x] `src/lib/utils/time-ago.ts` — Utility function: `timeAgo(date)` → "Il y a 3 jours", "Il y a 2 heures", etc. (French)

**Checklist:**

- [x] Listing detail page loads with SSR (check view-source)
- [x] Open Graph meta tags are present for social sharing
- [x] Own listing shows edit/delete actions
- [ ] Edit navigates to form pre-filled with existing data
- [x] Delete shows confirmation dialog and removes listing
- [x] Deactivated listings no longer appear on the map

---

## Week 7 — Messaging Core

### Step 22: Conversations list page with real-time updates

> PRD ref: Section 4.4.2 (Conversations List), Appendix A (`get_user_conversations` RPC)

**Files to create/modify:**

- [x] `src/app/messages/page.tsx` — Conversations list page:
  - Call `get_user_conversations` RPC on load
  - Render list of conversation rows ordered by last activity
  - Each row: avatar (48px), username (bold), last message snippet (gray, truncated), species context label (subtle), timestamp (right), unread badge
  - Empty state: botanical illustration + "Pas encore de conversations" + CTA to `/carte`
  - Pull-to-refresh gesture (or button)
- [x] `src/components/chat/conversation-row.tsx` — Single conversation row component
- [x] `src/components/chat/empty-conversations.tsx` — Empty state component
- [x] `src/lib/supabase/queries/conversations.ts` — Add:
  - `getUserConversations()` — calls `get_user_conversations` RPC
  - `getConversationMessages(conversationId, limit, offset)` — paginated messages query
- [ ] `src/lib/hooks/use-conversations-realtime.ts` — Custom hook:
  - Subscribe to Supabase Realtime on `conversations` table (filtered by user as participant)
  - On new/updated conversation: re-fetch conversations list or patch locally
  - Returns live-updating conversations array
- [ ] `src/lib/stores/chat-store.ts` — Zustand store:
  - `totalUnreadCount` — derived from conversations data
  - Used by bottom nav badge
- [ ] `src/components/layout/bottom-nav.tsx` — Wire unread badge to `totalUnreadCount` from chat store

**Checklist:**

- [x] Conversations list loads and shows all user conversations
- [x] Rows display correct info (avatar, username, snippet, timestamp, unread)
- [ ] List updates in real-time when new messages arrive
- [ ] Unread badge in bottom nav shows correct count
- [x] Empty state displays when no conversations exist

---

### Step 23: Chat interface — text messaging with Supabase Realtime

> PRD ref: Section 4.4.3 (Chat Interface), Section 4.4.4 (Real-Time Architecture)

**Files to create/modify:**

- [x] `src/app/messages/[conversationId]/page.tsx` — Chat page:
  - Header: back arrow, other user's avatar + username (tappable → `/u/[username]`), online indicator (placeholder)
  - Context card: pinned below header, shows listing thumbnail (40px), species, size badge. Tappable → listing detail.
  - Message area: scrollable list, newest at bottom, auto-scroll on new message
  - Date separators ("Aujourd'hui", "Hier", "12 mars 2026")
  - Input bar at bottom: text field (auto-expanding, max 4 lines), attachment button (placeholder for Step 25), send button
- [x] `src/components/chat/chat-header.tsx` — Chat header component
- [x] `src/components/chat/context-card.tsx` — Listing context card (pinned at top)
- [x] `src/components/chat/message-bubble.tsx` — Message bubble component:
  - Sent messages: right-aligned, `--color-primary` background, white text
  - Received messages: left-aligned, `--color-neutral-100` background, dark text
  - Timestamp below each message (small, gray)
  - Status indicator below sent messages (Step 24)
- [x] `src/components/chat/message-input.tsx` — Input bar component:
  - Auto-expanding textarea
  - Send button (enabled when input is non-empty)
  - Send on tap or Enter key (Shift+Enter for newline)
- [x] `src/components/chat/date-separator.tsx` — Date group separator
- [x] `src/lib/hooks/use-chat-realtime.ts` — Custom hook:
  - Subscribe to Supabase Realtime on `messages` table, filtered by `conversation_id`
  - On INSERT: append new message to local state
  - On UPDATE: update message status (for read receipts)
  - Returns `{ messages, sendMessage, isLoading }`
- [x] `src/lib/supabase/queries/conversations.ts` — Add:
  - `getConversationWithDetails(conversationId)` — fetch conversation + other user profile + listing info

**Checklist:**

- [x] Chat page loads with conversation history
- [x] New messages appear in real-time (< 500ms)
- [x] Auto-scroll to latest message
- [x] Sent messages appear right-aligned in green; received messages left-aligned in gray
- [x] Date separators group messages by day
- [x] Context card shows correct listing info and is tappable
- [x] Send button works and message persists in DB

---

### Step 24: Message status indicators (sent, delivered, read)

> PRD ref: Section 4.4.3 (Message Status Indicators table)

**Files to create/modify:**

- [x] `src/components/chat/message-status.tsx` — Status indicator component:
  - `sending`: spinner icon
  - `sent`: single gray checkmark (✓)
  - `delivered`: double gray checkmarks (✓✓)
  - `read`: double blue checkmarks (✓✓ in `--color-primary`)
  - Uses Lucide icons: `Check`, `CheckCheck`
- [x] `src/lib/hooks/use-chat-realtime.ts` — Update to handle status:
  - When sending: optimistically set status to `sending`, then `sent` on DB confirmation
  - Listen for UPDATE events on messages (status changes) → update local state
- [x] `src/lib/hooks/use-mark-as-read.ts` — Custom hook:
  - Uses IntersectionObserver to detect when a received message enters the viewport
  - On visibility: update `messages.status` to `read` for that message
  - Debounced to batch multiple read updates
- [x] `src/components/chat/message-bubble.tsx` — Wire `<MessageStatus />` below sent messages

**Checklist:**

- [x] Sent messages show spinner → single check → double check → blue double check
- [x] Status transitions are driven by real-time updates
- [x] Opening a chat marks visible messages as read
- [x] Read status updates propagate to the sender in real-time

---

## Week 8 — Messaging Polish

### Step 25: Photo messages in chat

> PRD ref: Section 4.4.3 (Message types: Photo)

**Files to create/modify:**

- [x] `src/components/chat/message-input.tsx` — Add attachment button (📎 icon):
  - Opens native file picker (image types)
  - On selection: compress image (same pipeline as listing photos), show preview in input area
  - Send button uploads image to `chat-images/{conversationId}/` bucket, then inserts message with `type: 'image'` and `image_url`
- [x] `src/components/chat/photo-message.tsx` — Photo message bubble:
  - Inline thumbnail (max width 240px, rounded corners)
  - Tap → fullscreen photo viewer (using Radix Dialog or custom overlay)
  - Loading skeleton while image loads
- [x] `src/components/ui/photo-viewer.tsx` — Fullscreen photo viewer:
  - Dark overlay
  - Pinch-to-zoom on mobile
  - Tap backdrop to dismiss
  - Close button (top-right)
- [x] `src/components/chat/message-bubble.tsx` — Update to render `<PhotoMessage />` when `message.type === 'image'`

**Checklist:**

- [x] Attachment button opens file picker
- [x] Selected photo is compressed and uploaded
- [x] Photo message renders as inline thumbnail
- [x] Tapping photo opens fullscreen viewer
- [x] Photo messages show in both sender's and receiver's chat

---

### Step 26: Typing indicators + online status (Presence)

> PRD ref: Section 4.4.3 (Typing Indicator, Online status), Section 4.4.4 (Presence channels)

**Files to create/modify:**

- [x] `src/lib/hooks/use-chat-presence.ts` — Combined presence hook (typing + online):
  - Broadcasts typing state to Supabase Realtime Presence channel `presence:[conversationId]`
  - On input change: broadcast `{ typing: true }` with 3-second debounce
  - Auto-timeout: if no new input for 3 seconds, broadcast `{ typing: false }`
  - Listens for other user's typing state and online presence
  - Returns `{ isOtherUserTyping, isOtherUserOnline, setTyping }`
- [x] `src/components/chat/typing-bubble.tsx` — Animated "..." typing indicator bubble:
  - Three dots with staggered bounce animation
  - Shown in the received messages area when other user is typing
- [x] `src/components/chat/chat-header.tsx` — Add online status indicator:
  - Green dot next to avatar when other user is online
  - "En ligne" text when online
- [x] `src/components/chat/message-input.tsx` — Wire `setTyping` from presence hook to input `onChange`

**Checklist:**

- [x] Typing indicator appears when other user types (within 1 second)
- [x] Typing indicator disappears after 3 seconds of inactivity
- [x] Online status green dot appears for active users
- [x] Presence channels connect/disconnect correctly on page navigation

---

### Step 27: Push notifications for new messages (Edge Function + Web Push)

> PRD ref: Section 4.4.5 (Push Notifications), Section 6.2 (Push, Edge Functions rows)

**Terminal commands:**

```bash
pnpm supabase functions new push-notification
pnpm add -D web-push @types/web-push
```

Generate VAPID keys (run once, save in env):

```bash
npx web-push generate-vapid-keys
```

Store the output in `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<private key>
```

**Files to create/modify:**

- [x] `supabase/functions/push-notify/index.ts` — Supabase Edge Function (Deno):
  - Receives `{ user_id, title, body, url }` payload
  - Looks up recipient's push subscriptions from `push_subscriptions` table
  - Sends Web Push notification via VAPID + Web Crypto (no npm dependency)
  - Prepared to be called by a Database Webhook (not wired yet)
- [x] Set up Database Webhook in Supabase:
  - Table: `messages`, Event: `INSERT`
  - Target: Edge Function `push-notify`
  - Implemented via `pg_net` trigger in `supabase/migrations/20260322000000_push_webhook.sql`
- [x] `src/lib/hooks/use-push-subscription.ts` — Custom hook:
  - Requests notification permission from the user
  - Subscribes to Web Push using the VAPID public key
  - Stores the subscription in `push_subscriptions` table (UPSERT on endpoint)
  - Supports unsubscribe flow
- [x] `src/app/profil/parametres/page.tsx` — Settings page with push notification toggle (Activer/Désactiver)
- [x] `src/app/sw.ts` — Updated service worker to handle `push` event:
  - Display notification with title, body, icon
  - Handle notification `click` → open the conversation URL

**Checklist:**

- [x] VAPID keys are generated and stored
- [x] Edge Function deploys successfully (`pnpm supabase functions deploy push-notify`)
- [x] Database Webhook is configured for `messages` INSERT
- [x] Browser prompts for notification permission
- [x] Push subscription is stored in `push_subscriptions`
- [x] Notifications are received when a new message arrives and app is backgrounded
- [x] Clicking the notification opens the correct conversation

---

## Week 9 — Profile & Social

### Step 28: Profile dashboard + edit profile

> PRD ref: Section 4.5.1 (User Bio / Info)

**Files to create/modify:**

- [x] `src/app/profil/page.tsx` — Profile dashboard:
  - Header: large avatar (96px), username, bio, join date ("Membre depuis mars 2026")
  - Stats row: 3 cards — "Boutures donnees" (count of active + inactive own listings), "Boutures recues" (placeholder count), "Abonnes" (follower count, tappable)
  - Navigation list: 4 rows — Adresse, Bibliotheque de plantes, Abonnes, Parametres
  - "Modifier" button in header
- [x] `src/components/profile/profile-header.tsx` — Profile header with avatar, name, bio
- [x] `src/components/profile/stats-row.tsx` — Three stat cards in a row
- [x] `src/components/profile/edit-profile-sheet.tsx` — Bottom sheet for editing:
  - Avatar change (upload new, same compression pipeline)
  - Username edit (with uniqueness re-check)
  - Bio textarea (max 200 chars)
  - "Enregistrer" button
- [x] `src/lib/supabase/queries/profile.ts` — Profile queries:
  - `getProfile(userId)` — fetch profile with computed stats (listing count, follower count)
  - `updateProfile(userId, data)` — update username, bio, avatar_url

**Checklist:**

- [x] Profile page shows correct user info and stats
- [x] Edit sheet allows changing avatar, username, bio
- [x] Stats are computed from the database (not hardcoded)
- [x] Navigation rows link to correct sub-pages

---

### Step 29: Address management page with geocoding map

> PRD ref: Section 4.5.2 (Adresse — Address Management)

**Files to create/modify:**

- [x] `src/app/profil/adresse/page.tsx` — Address management page:
  - Current address display (formatted text)
  - Address text input with geocoding autocomplete
  - Geocoding flow: type → select suggestion → preview → save
  - "Mettre a jour" button saves to `profiles` table
  - Privacy notice text: "Votre adresse exacte n'est jamais partagee..."
- [ ] `src/components/profile/address-map.tsx` — Small MapLibre map with a draggable marker (deferred — optional enhancement)
- [x] `src/lib/supabase/mutations/profile.ts` — `updateAddress(userId, addressData)` — updates address fields in `profiles`

**Checklist:**

- [x] Current address is displayed correctly
- [ ] Map shows pin at current address (deferred — optional enhancement)
- [x] Geocoding autocomplete works in the text input
- [ ] Dragging the pin updates the address via reverse geocoding (deferred — optional enhancement)
- [x] Saving updates the profile in the database
- [x] Privacy notice is visible

---

### Step 30: Plant Pokédex (species encyclopedia, collection states, add-from-card)

> PRD ref: Section 4.5.3 (Pokédex des Plantes), Section 4.3.6 (From Plant Library Shortcut)

**Concept:** The library page is now a "Pokédex" that displays ALL species from the `species` table. Each card shows whether the user owns that species (Active = full color + badge) or not (Inactive = grayscale + 40% opacity). Tapping an inactive card opens a dialog to add it to the user's collection.

**Files to create/modify:**

- [ ] `supabase/migrations/XXXXXXXX_add_illustration_url.sql` — Add `illustration_url TEXT` column to `species` table
- [ ] `src/lib/types/database.types.ts` — Regenerate or manually add `illustration_url` to `species` Row/Insert/Update types
- [ ] `src/components/ui/plant-placeholder.tsx` — Default SVG placeholder:
  - Minimalist "Line Art" style (thin strokes, flat accent colors)
  - Used when `species.illustration_url` is null
  - Consistent DA across the entire Pokédex
- [ ] `src/lib/supabase/queries/species.ts` — Add `getAllSpecies(page, limit)`:
  - Fetches all species ordered by `common_name` ASC
  - Supports pagination (offset-based, 30 per page)
  - Returns `{ id, common_name, scientific_name, family, illustration_url }`
- [ ] `src/lib/supabase/queries/plant-library.ts` — Add `getUserOwnedSpeciesIds(userId)`:
  - Returns a `Set<number>` of `species_id` values from the user's `plant_library`
  - Used to compute `isOwned` for each species card
- [ ] `src/components/profile/species-pokedex-card.tsx` — SpeciesPokédexCard component:
  - Props: `species: Species`, `isOwned: boolean`
  - Active state: full opacity, vivid colors, green "Dans ma collection" badge
  - Inactive state: `grayscale opacity-40` Tailwind classes
  - Inactive card click → opens "Add to Collection" Dialog (species pre-filled, photo upload + notes)
  - Active card click → navigates to plant detail page
- [ ] `src/app/profil/bibliotheque/page.tsx` — Rewrite as Pokédex page:
  - Fetch all species with pagination (infinite scroll, 30 per batch)
  - Fetch user's `plant_library` to compute `isOwned` per species
  - Grid: 3 cols mobile, 4 tablet, 5 desktop
  - Search bar at top (filters by `common_name`)
  - Render `<SpeciesPokédexCard>` for each species
- [x] `src/components/profile/plant-card.tsx` — Keep for existing plant detail navigation (no changes)
- [x] `src/app/profil/bibliotheque/ajouter/page.tsx` — Keep existing add page (no changes)
- [x] `src/app/profil/bibliotheque/[plantId]/page.tsx` — Keep existing detail page (no changes)
- [x] `src/lib/supabase/queries/plant-library.ts` — Existing CRUD functions unchanged:
  - `getUserPlants(userId)`, `getPlantById(plantId)`, `addPlant(userId, data)`, `updatePlant(plantId, data)`, `deletePlant(plantId)`

**Checklist:**

- [ ] Pokédex grid displays ALL species from the `species` table
- [ ] Active cards (user owns species) show full color + "Dans ma collection" badge
- [ ] Inactive cards (user does not own) show grayscale + 40% opacity
- [ ] Tapping inactive card opens "Add to Collection" dialog with species pre-filled
- [ ] Adding from dialog inserts into `plant_library` and transitions card to active
- [ ] Infinite scroll loads species in batches of 30
- [ ] Search bar filters species by common_name
- [ ] Default line-art SVG placeholder renders when `illustration_url` is null
- [x] Plant detail page still works for existing plants
- [x] "Proposer en don" flow unchanged

---

### Step 31: Followers / following system + public profile

> PRD ref: Section 4.5.4 (Abonnes), Section 4.5.1 (Public Profile)

**Files to create/modify:**

- [x] `src/app/profil/abonnes/page.tsx` — Followers list:
  - List of users who follow the current user
  - Each row: avatar (40px), username, "Suivre" button (if not already following back)
  - Tap row → navigate to public profile
- [x] `src/app/profil/abonnements/page.tsx` — Following list:
  - Same layout, each row has "Ne plus suivre" button
- [x] `src/app/u/[username]/page.tsx` — Public profile page (SSR):
  - Avatar, username, bio, join date, stats
  - Plant library grid (public entries)
  - Active listings link (→ map filtered by donor)
  - "Suivre" / "Ne plus suivre" button
  - "Signaler" in overflow menu (placeholder)
- [x] `src/components/profile/follow-button.tsx` — Follow/unfollow button:
  - Optimistic UI: instant toggle, background DB persist
  - Insert/delete from `follows` table
- [x] `src/lib/supabase/queries/follows.ts` — Functions:
  - `getFollowers(userId)` — list of followers with profile data
  - `getFollowing(userId)` — list of following with profile data
  - `isFollowing(followerId, followingId)` — boolean check
  - `followUser(followingId)` — insert into follows
  - `unfollowUser(followingId)` — delete from follows
  - `getFollowerCount(userId)` — count
- [x] `src/lib/supabase/queries/public-profile.ts` — `getPublicProfile(username)` + `isFollowingServer()` for the public profile page (SSR)

**Push notification for followers on new listing (wire-up):**

- [ ] `supabase/functions/push-notification/index.ts` — Extend to also handle a separate webhook for `listings` INSERT:
  - On new listing: query followers of the donor
  - Send push to all followers: "[Username] vient de proposer une nouvelle bouture !"
  - Set up Database Webhook for `listings` INSERT → `push-notification` Edge Function
  - ⚠️ Deferred to Week 10 (PWA + Service Worker implementation)

**Checklist:**

- [x] Followers list shows accurate followers with reciprocal follow button
- [x] Following list shows who the user follows with unfollow button
- [x] Follow/unfollow is instant (optimistic UI)
- [x] Public profile renders with SSR and is accessible without auth
- [x] Follower count updates on profile after follow/unfollow
- [ ] Push notification sent to followers when user creates a new listing (deferred to Week 10)

---

## Week 10 — PWA Polish & Launch Prep

### Step 32: Offline caching strategies + background sync

> PRD ref: Section 7.1.2 (Service Worker Strategy), Section 7.1.3 (Offline Capabilities)

**Files to create/modify:**

- [x] `src/app/sw.ts` — Expand service worker with full caching strategies:
  - **Precache** (build-time): app shell HTML, CSS, JS bundles
  - **Cache-first** (runtime): Google Fonts (1 year TTL), map tiles (7 days), user/listing images (30 days)
  - **Stale-while-revalidate**: API responses for listings (5 min)
  - **Network-first**: conversations and messages (always try fresh, fall back to cache)
- [ ] `src/lib/utils/offline-queue.ts` — IndexedDB-based queue for offline actions (deferred — post-MVP)
- [x] `src/components/ui/offline-banner.tsx` — "Vous etes hors ligne" banner:
  - Shown at top of screen when `navigator.onLine === false`
  - Subtle yellow background
  - Disappears on reconnection
- [x] `src/components/layout/connectivity-provider.tsx` — React context that tracks online/offline state and provides it to the app

**Checklist:**

- [x] App shell loads offline after first visit
- [x] Cached listings are viewable offline
- [x] Cached conversations are viewable offline
- [x] Offline banner appears when disconnected
- [ ] Queued actions replay on reconnection (deferred — post-MVP)

---

### Step 33: Loading skeletons, empty states, error boundaries

> PRD ref: Section 5.5 (Loading states), Section 5.7 (Illustrations and Empty States)

**Files to create/modify:**

- [x] `src/components/ui/skeleton.tsx` — Skeleton loader component:
  - Shimmering placeholder matching content shape
  - Animation: background-position shimmer, 1500ms loop, linear (PRD Section 5.8)
- [x] Skeleton variants inlined in route-specific `loading.tsx` files:
  - Carte loading: map placeholder + search bar + bottom sheet skeletons
  - Messages loading: conversation row skeletons with avatar + text placeholders
  - Profil loading: avatar + stats + nav items skeletons
  - Bibliothèque loading: grid card skeletons
- [ ] Empty state components (reuse illustrations table from PRD Section 5.7):
  - `src/components/map/empty-map.tsx` — "Aucune bouture dans cette zone..."
  - `src/components/chat/empty-conversations.tsx` — (already created in Step 22, verify)
  - `src/components/profile/empty-library.tsx` — "Votre bibliotheque est vide..."
  - `src/components/profile/empty-followers.tsx` — "Personne ne vous suit encore..."
- [x] `src/app/error.tsx` — Global error boundary:
  - Friendly error message with botanical illustration
  - "Réessayer" (Retry) button using `unstable_retry`
- [x] `src/app/not-found.tsx` — Custom 404 page:
  - "Page introuvable" message
  - Botanical illustration (Sprout icon)
  - Link back to map
- [x] Add `loading.tsx` files for key routes:
  - `src/app/loading.tsx` (global)
  - `src/app/carte/loading.tsx`
  - `src/app/messages/loading.tsx`
  - `src/app/profil/loading.tsx`
  - `src/app/profil/bibliotheque/loading.tsx`

**Checklist:**

- [x] Skeleton loaders appear during data fetching
- [ ] Empty states render with illustrations and helpful text
- [x] Error boundary catches and displays errors gracefully
- [x] 404 page renders for unknown routes
- [x] `loading.tsx` files provide instant feedback during navigation

---

### Step 34: Install prompt, Dockerfile, CI/CD pipeline

> PRD ref: Section 7.1.4 (Install Prompt), Section 9.1 (Infrastructure), Section 9.2 (CI/CD Pipeline)

**Files to create/modify:**

- [x] `src/components/layout/install-prompt.tsx` — Custom PWA install banner:
  - Listens for `beforeinstallprompt` event
  - Banner: "Installer Bouture" + Install button + dismiss button
  - On dismiss: don't reappear for 30 days (stored in localStorage)
  - On install: trigger the native install prompt
- [ ] `Dockerfile` — Multi-stage Docker build for Next.js (deferred — not in scope)
- [ ] `.dockerignore` — Exclude `node_modules`, `.next`, `.git`, `.env*` (deferred — not in scope)
- [ ] `.github/workflows/deploy.yml` — GitHub Actions CI/CD pipeline (deferred — not in scope)
- [ ] `.env.example` — Document all required environment variables (deferred — not in scope)

**Checklist:**

- [x] Install prompt appears when `beforeinstallprompt` fires (test in incognito)
- [ ] `docker build` completes successfully (deferred)
- [ ] `docker run` starts the app on port 3000 (deferred)
- [ ] GitHub Actions workflow runs on push to main (deferred)
- [ ] `.env.example` documents all variables (deferred)

---

### Step 35: Cross-browser testing + Lighthouse audit

> PRD ref: Section 7.2 (Performance Targets), Section 7.5 (Cross-Platform Compatibility)

This is a manual testing and optimization step. No new dependencies or files — purely verification and fixes.

**Testing matrix:**

- [ ] **Chrome (Android):** Full test — map, pins, bottom sheets, messaging, push notifications, PWA install
- [ ] **Safari (iOS 16.4+):** Full test — map, gestures, messaging, push notifications, PWA install
- [ ] **Safari (iOS < 16.4):** Verify graceful degradation — no push, all other features work
- [ ] **Firefox (Desktop):** Full test — map, messaging, all pages
- [ ] **Chrome (Desktop):** Full test — responsive layout at 1024px+
- [ ] **Edge:** Quick smoke test — auth, map, messaging

**Lighthouse audit targets (from PRD Section 7.2):**

- [ ] Performance score > 90
- [ ] PWA score > 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms

**Run audit:**

```bash
pnpm next build && pnpm next start
# Then open Chrome DevTools → Lighthouse → run audit on /carte
```

**Optimization checklist:**

- [ ] Images are lazy-loaded (Next.js `<Image>` or `loading="lazy"`)
- [ ] Map tiles are cached by service worker
- [ ] JavaScript bundle is code-split per route (verify with `next build` output)
- [ ] Fonts are preloaded and self-hosted (no FOUT)
- [ ] No layout shift from dynamic content (skeleton loaders prevent CLS)
- [ ] Service worker precaches the app shell

**Final pre-launch checks:**

- [ ] All routes are accessible and functional
- [ ] Auth flows work end-to-end (signup → verify → onboarding → map)
- [ ] Map → pin → contact → chat flow works end-to-end
- [ ] Add cutting flow works with photo upload
- [ ] Real-time messaging works between two users
- [ ] Plant library → "Proposer en don" flow works
- [ ] Follow/unfollow works
- [ ] Push notifications are received
- [ ] PWA is installable
- [ ] Offline banner appears when disconnected
- [ ] No console errors in production build

---

## Summary: Dependency Installation Timeline

| Step | Dependencies Added |
|------|-------------------|
| 1 | `@supabase/supabase-js`, `@supabase/ssr`, `zustand`, `framer-motion`, `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-popover`, `@radix-ui/react-slot`, `react-hook-form`, `@hookform/resolvers`, `zod`, `supabase` (dev) |
| 2 | `@fontsource-variable/fraunces`, `@fontsource-variable/dm-sans` |
| 5 | `@serwist/next`, `serwist` (dev) |
| 9 | `browser-image-compression` |
| 10 | `maplibre-gl` (or `react-map-gl` + `mapbox-gl`) |
| 12 | `supercluster`, `@types/supercluster` (dev) |
| 15 | `embla-carousel-react` |
| 27 | `web-push` (dev), `@types/web-push` (dev) |

**Total npm dependencies:** ~20 production, ~6 dev

---

## Summary: Supabase Migrations & Config

| Step | Migration/Config |
|------|-----------------|
| 3 | `supabase init`, `supabase start` |
| 4 | Initial schema migration (all tables, indexes, RLS, RPCs, triggers, Realtime) |
| 17 | Expanded species seed data (100+ entries) |
| 27 | Edge Function `push-notify`, Database Webhook via `pg_net` trigger for `messages` INSERT |
| 31 | Extend `push-notification` Edge Function for follower notifications |

---

## Summary: File Count Estimate per Step

| Step | Approx. Files Created/Modified |
|------|-------------------------------|
| 1 | ~15 (scaffold + directories + placeholders) |
| 2 | ~3 (globals.css, tailwind.config, layout) |
| 3 | ~4 (supabase config, client, server, middleware) |
| 4 | ~2 (migration, seed, codegen output) |
| 5 | ~4 (manifest, icons, sw, next.config) |
| 6 | ~4 (client, server, middleware, hook) |
| 7 | ~6 (login, signup, auth layout, button, input, card) |
| 8 | ~4 (callback, reset, update-password, toast) |
| 9 | ~6 (onboarding, compression util, geocoding util, avatar, stepper) |
| 10 | ~5 (map-view, carte page, bottom-nav, layout, map-store) |
| 11 | ~4 (listings queries, hook, types, map integration) |
| 12 | ~4 (map-pins, pin SVG, clustering util, results-count) |
| 13 | ~3 (search-bar, geocoding-overlay, store update) |
| 14 | ~5 (bottom-sheet, filter-sheet, chip, slider, store update) |
| 15 | ~3 (listing-bottom-sheet, carousel, badge) |
| 16 | ~3 (conversation queries, contact button, sheet update) |
| 17 | ~3 (seed, species queries, autocomplete) |
| 18 | ~4 (donner page, size-selector, address-picker, zod schema) |
| 19 | ~3 (photo-upload, compression util, storage helpers) |
| 20 | ~4 (preview, mutations, geo-jitter, submit handler) |
| 21 | ~5 (listing detail page, update/delete mutations, edit mode, confirm dialog, time-ago) |
| 22 | ~6 (messages page, conversation-row, empty state, queries, realtime hook, chat-store) |
| 23 | ~7 (chat page, header, context-card, message-bubble, input, date-separator, realtime hook) |
| 24 | ~3 (status component, mark-as-read hook, bubble update) |
| 25 | ~3 (input update, photo-message, photo-viewer) |
| 26 | ~4 (typing hook, typing-bubble, online-status hook, header update) |
| 27 | ~4 (edge function, push hook, push util, sw update) |
| 28 | ~5 (profil page, header, stats, edit-sheet, profile queries) |
| 29 | ~3 (adresse page, address-map, profile mutation) |
| 30 | ~6 (library page, plant-card, add-sheet, plant detail, CRUD queries, donner update) |
| 31 | ~6 (followers page, following page, public profile, follow-button, follows queries, edge fn update) |
| 32 | ~4 (sw update, offline-queue, offline-banner, connectivity-provider) |
| 33 | ~12 (skeleton, 4 skeleton variants, 4 empty states, error, not-found, 4 loading files) |
| 34 | ~4 (install-prompt, Dockerfile, CI workflow, .env.example) |
| 35 | ~0 (testing and optimization only) |

**Total:** ~150 files across 35 steps
