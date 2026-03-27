# Expense Tracker — Build Plan

The project is divided into 8 phases. Each phase is self-contained and builds on the previous one. Complete each phase fully before moving to the next.

---

## Phase 1: Project Scaffolding & Database Setup

**Goal:** Get both apps running with the database connected.

- [x] **1.1** Initialize git repository
- [x] **1.2** Create NestJS backend (`nest new backend`)
- [x] **1.3** Create Next.js frontend (`create-next-app frontend`)
- [x] **1.4** Set up Tailwind CSS v4 in the frontend (CSS-first config in `globals.css`)
- [x] **1.5** Install shadcn/ui in the frontend, add base components (Button, Input, etc.)
- [x] **1.6** Install Prisma in the backend, configure `datasource` for PostgreSQL
- [x] **1.7** Write the full Prisma schema (`User`, `Expense`, `Category` enum) as defined in `DATABASE.md`
- [x] **1.8** Start PostgreSQL via Docker or local Homebrew install
- [x] **1.9** Run `prisma migrate dev` to create tables in PostgreSQL
- [x] **1.10** Create `PrismaModule` and `PrismaService` in NestJS
- [x] **1.11** Verify: backend starts on port 3001, frontend starts on port 3000, Prisma connects to PostgreSQL
- [x] **1.12** Create `.gitignore` (node_modules, .env, .next, dist)
- [x] **1.13** Create `.env` files with placeholder values

**Deliverable:** Both apps running, database tables created, Prisma connected. ✅

---

## Phase 2: Backend — Authentication Module

**Goal:** Users can register and log in via the API.

- [x] **2.1** Install dependencies: `@nestjs/passport`, `@nestjs/jwt`, `passport`, `passport-jwt`, `@node-rs/argon2`, `zod`, `cookie-parser`
- [x] **2.2** Create `UsersModule` and `UsersService` (findByEmail, findById, create)
- [x] **2.3** Create `AuthModule`, `AuthController`, `AuthService`
- [x] **2.4** Implement `POST /auth/register`:
  - Zod validation (name, email, password)
  - Check email uniqueness
  - Hash password with Argon2id
  - Create user via Prisma
  - Sign JWT, set HTTP-only cookie
  - Return user data (no password)
- [x] **2.5** Implement `POST /auth/login`:
  - Zod validation (email, password)
  - Find user by email
  - Verify password with Argon2id
  - Sign JWT, set HTTP-only cookie
  - Return user data
- [x] **2.6** Implement `POST /auth/logout`:
  - Clear the JWT cookie
- [x] **2.7** Implement `GET /auth/me`:
  - Return current user from JWT
- [x] **2.8** Create `JwtStrategy` (Passport) — extract token from cookie
- [x] **2.9** Create `JwtAuthGuard` (reusable guard)
- [x] **2.10** Create `@CurrentUser()` parameter decorator
- [x] **2.11** Create `ZodValidationPipe` (reusable pipe for Zod schemas)
- [x] **2.12** Configure CORS with `credentials: true` and `FRONTEND_URL` origin
- [x] **2.13** Add `cookie-parser` middleware to NestJS
- [x] **2.14** Add `helmet` for security headers
- [x] **2.15** Add `@nestjs/throttler` with tiered rate limiting (100 req/min global, 10 req/min on auth routes)
- [x] **2.16** Test all auth endpoints manually (curl or Postman)

**Deliverable:** Full auth flow working — register, login, logout, me — all via HTTP-only cookies. ✅

---

## Phase 3: Backend — Expenses Module

**Goal:** Full CRUD + filtering + summary for expenses.

- [x] **3.1** Create `ExpensesModule`, `ExpensesController`, `ExpensesService`
- [x] **3.2** Define Zod schemas for expense DTOs (create, update, query filters)
- [x] **3.3** Implement `POST /expenses`:
  - Validate with Zod
  - Associate with current user (from JWT)
  - Create via Prisma
- [x] **3.4** Implement `GET /expenses`:
  - Filter by userId (always — users only see their own)
  - Optional filter by category
  - Optional filter by date range (startDate, endDate)
  - Pagination (page, limit)
  - Sort by date descending
- [x] **3.5** Implement `PATCH /expenses/:id`:
  - Validate with Zod (partial schema)
  - Verify ownership (expense.userId === currentUser.id)
  - Update via Prisma
- [x] **3.6** Implement `DELETE /expenses/:id`:
  - Verify ownership
  - Delete via Prisma
- [x] **3.7** Implement `GET /expenses/summary`:
  - Aggregate total amount and count
  - Group by category
  - Optional date range filter
- [x] **3.8** Apply `JwtAuthGuard` to all expense endpoints
- [x] **3.9** Create global exception filter (handles HttpException, ThrottlerException, Prisma errors — P2002, P2025, connection failures)
- [x] **3.10** Test all expense endpoints manually

**Deliverable:** Complete expense API — CRUD, filtering, summary — all protected by auth. ✅

---

## Phase 4: Frontend — Layout & Auth Pages

**Goal:** Login and registration pages working, connected to backend.

- [x] **4.1** Set up root layout (`app/layout.tsx`) with font, Tailwind, providers
- [x] **4.2** Create an API client utility (`lib/api.ts`) — fetch wrapper with `credentials: 'include'` for cookies
- [x] **4.3** Create auth context/provider for managing user state
- [x] **4.4** Create shared Zod schemas for form validation (`lib/validators.ts`)
- [x] **4.5** Build the **Register** page (`/register`):
  - Form: name, email, password, confirm password
  - React Hook Form + Zod validation
  - Submit → call `POST /auth/register`
  - On success → redirect to `/expenses`
  - On error → show inline error messages
  - Link to "Already have an account? Log in"
- [x] **4.6** Build the **Login** page (`/login`):
  - Form: email, password
  - React Hook Form + Zod validation
  - Submit → call `POST /auth/login`
  - On success → redirect to `/expenses`
  - On error → show inline error message
  - Link to "Don't have an account? Register"
- [x] **4.7** Style auth pages — centered card layout, clean and minimal
- [x] **4.8** Test registration and login flow end-to-end

**Deliverable:** Users can register and log in through the UI. ✅

---

## Phase 5: Frontend — Middleware & Route Protection

**Goal:** Unauthenticated users are blocked from dashboard pages.

- [x] **5.1** Create `middleware.ts` in the frontend root:
  - Check for `token` cookie on `/(dashboard)/*` routes
  - If missing → redirect to `/login`
  - If present → allow through
- [x] **5.2** Redirect authenticated users away from `/login` and `/register` → `/expenses`
- [x] **5.3** Redirect root `/` → `/expenses` (if authenticated) or `/login` (if not)
- [x] **5.4** Handle 401 responses globally in the API client (redirect to `/login`)
- [x] **5.5** Test: access `/expenses` without logging in → should redirect to `/login`
- [x] **5.6** Test: access `/login` while logged in → should redirect to `/expenses`

**Deliverable:** Route protection working on all frontend routes. ✅

---

## Phase 6: Frontend — Expense Management Pages

**Goal:** Users can add, view, edit, and delete expenses.

- [x] **6.1** Create the **Dashboard Layout** (`(dashboard)/layout.tsx`):
  - Top navigation bar with app name, user name, logout button
  - Navigation links: Expenses, Overview
  - Clean, minimal design
- [x] **6.2** Build the **Expenses** page (`/expenses`):
  - Fetch and display expenses in a table (date, category, amount, note, actions)
  - Empty state when no expenses exist
  - Loading skeleton while fetching
- [x] **6.3** Build the **Add Expense** dialog:
  - Triggered by "Add Expense" button
  - Form: amount, category (select), date (date picker), note (textarea)
  - Zod validation
  - Submit → `POST /expenses` → refresh list → close dialog → show toast
- [x] **6.4** Build the **Edit Expense** dialog:
  - Triggered by edit button on each row
  - Same form as add, pre-filled with current values
  - Submit → `PATCH /expenses/:id` → refresh list → close dialog → show toast
- [x] **6.5** Build the **Delete Expense** confirmation:
  - Triggered by delete button on each row
  - Confirmation dialog with cancel/confirm
  - Submit → `DELETE /expenses/:id` → refresh list → show toast
- [x] **6.6** Implement **Category Filter**:
  - Select dropdown above the table
  - "All Categories" default option
  - Selecting a category refetches with `?category=X`
- [x] **6.7** Implement **Date Range Filter**:
  - Start date and end date inputs above the table
  - Changing dates refetches with `?startDate=X&endDate=Y`
  - Can be combined with category filter
- [x] **6.8** Category badges — styled colored chips in the table
- [x] **6.9** Format amounts as currency (e.g., $25.50)
- [x] **6.10** Format dates in a readable format (e.g., Mar 25, 2026)
- [x] **6.11** Test full CRUD flow end-to-end

**Deliverable:** Complete expense management — add, view, edit, delete with filters. ✅

---

## Phase 7: Frontend — Overview Page

**Goal:** Users can see expense summaries and category breakdowns.

- [x] **7.1** Build the **Overview** page (`/overview`):
  - Total expenses card (large number, prominent)
  - Total expense count
  - Category breakdown table (category, total, count, percentage)
- [x] **7.2** Add date range filter on the overview page
- [x] **7.3** Style summary cards — clean, data-focused design
- [x] **7.4** Handle empty state (no expenses in the selected range)
- [x] **7.5** Test with various date ranges and verify totals are correct

**Deliverable:** Overview page showing totals and category breakdown. ✅

---

## Phase 8: Polish & Final Touches

**Goal:** Production-quality finish.

- [x] **8.1** Error handling:
  - Segment error boundary (`error.tsx`) and root layout boundary (`global-error.tsx`)
  - Toast notifications for all success/error states with user-friendly messages
  - API client handles network failures, non-JSON responses, and server errors
  - Dedicated error states (with retry) on expenses and overview pages — distinct from empty states
  - Logout failure handled gracefully (toast + stays on page)
  - Backend: Prisma errors mapped to proper HTTP status codes (P2002→409, P2025→404, connection→503)
  - Backend: Register race condition handled (duplicate email via P2002 → 409)
  - Backend: JWT session expiry returns clear message ("Your session is no longer valid")
- [x] **8.2** Loading states:
  - Loading text on data fetch
  - Button loading states during form submission
  - Disable forms while submitting
- [x] **8.3** Responsive design:
  - Table scrolls horizontally on mobile
  - Forms are touch-friendly (shadcn/ui defaults)
  - Layout stacks on narrow viewports
- [x] **8.4** Accessibility:
  - All form inputs have labels
  - Focus management in dialogs (shadcn/ui handles this)
  - Keyboard navigation works
- [x] **8.5** Create `README.md` with:
  - Project description
  - Tech stack summary
  - Setup instructions (step by step)
  - How to run backend and frontend
  - Environment variable descriptions
- [x] **8.6** Clean up code:
  - No stray console.logs (only startup message and error logging)
  - No unused imports
  - Consistent formatting
- [x] **8.7** Final end-to-end test of all features
- [x] **8.8** Git: clean commit history, meaningful messages

**Deliverable:** Polished, production-ready application with documentation. ✅

---

## Phase 9: Settings Page

**Goal:** Users can manage their account — update profile, change password, export data, and delete their account.

- [x] **9.1** Create `users.schemas.ts` with Zod schemas (updateProfile, changePassword, deleteAccount)
- [x] **9.2** Extend `UsersService` with `updateName`, `updatePassword`, `deleteAccount` methods
- [x] **9.3** Create `UsersController` with:
  - `PATCH /users/profile` — update display name
  - `PATCH /users/password` — change password (requires current password verification, clears session)
  - `DELETE /users/account` — delete account (requires password verification, cascade deletes expenses)
- [x] **9.4** Register `UsersController` in `UsersModule`
- [x] **9.5** Add `GET /expenses/export` endpoint — CSV export with RFC 4180 escaping and CSV injection prevention
- [x] **9.6** Add `getAllForExport` method to `ExpensesService`
- [x] **9.7** Update `frontend/lib/api.ts` with user settings endpoints and CSV export
- [x] **9.8** Add Zod schemas for settings forms in `frontend/lib/validators.ts`
- [x] **9.9** Add `updateUser` and `clearUser` methods to auth context provider
- [x] **9.10** Add `alert-dialog` shadcn component for delete confirmation
- [x] **9.11** Build Settings page (`/settings`) with four sections:
  - Profile (change name)
  - Password (change password with forced re-login)
  - Export (download expenses as CSV)
  - Danger Zone (delete account with password confirmation)
- [x] **9.12** Add Settings to desktop sidebar nav and mobile user menu
- [x] **9.13** Add `/settings` to middleware protected routes
- [x] **9.14** Update documentation (API.md, OVERVIEW.md, STEPS.md)
- [x] **9.15** Apply rate limiting (10 req/min) on all settings endpoints

**Deliverable:** Settings page with profile management, password change, CSV export, and account deletion — all secured with password re-verification and rate limiting. ✅

---

## Phase 10: UI Overhaul & Modern Design

**Goal:** Transform the functional but basic UI into a polished, professional expense tracker with modern design patterns.

- [x] **10.1** Redesign theme — rich violet/indigo oklch palette with amber accents, Plus Jakarta Sans font, JetBrains Mono for monospace
- [x] **10.2** Redesign auth pages — split-screen layout (decorative left, form right) for desktop, single column for mobile
- [x] **10.3** Redesign dashboard layout — fixed dark sidebar (desktop), bottom tab bar with centered FAB (mobile)
- [x] **10.4** Rewrite overview as Dashboard Home:
  - Hero summary card with total spend, transaction count, month-over-month comparison badge, and mini bar chart
  - Date preset quick filters (This Month, Last Month, 3/6 Months, This Year, All Time) via chips + dropdown
  - Stats grid — 4 cards: Total Spend, Transactions, Avg per Expense, Top Category
  - Donut chart with rich legend (category icons, amounts, percentages, progress bars)
  - Recent transactions section with "View All" link
- [x] **10.5** Redesign expenses page:
  - Mobile: date-grouped transaction cards, tap to open detail bottom sheet (vaul drawer) with edit/delete
  - Desktop: full data table with hover note tooltip, inline edit/delete buttons, padded layout
  - Category filter chips and date range pickers
- [x] **10.6** Build custom date picker — portal-based calendar (createPortal to document.body) to avoid layout shift and clipping in drawers. Auto-flips up/down based on viewport space.
- [x] **10.7** Redesign expense form:
  - Responsive: Drawer on mobile, Dialog on desktop
  - Hero-sized amount input, 4×2 category icon grid, date quick-select chips (Today/Yesterday), textarea for notes
- [x] **10.8** Centralize category config — icons (Lucide), Tailwind colors, hex chart colors in `lib/constants.ts`. Distinct palettes per category.
- [x] **10.9** Build global expense form provider (ExpenseFormProvider context) — single form instance, openable from sidebar, FAB, or any page. `onExpenseChange` subscription for auto-refresh.
- [x] **10.10** Enhanced mobile bottom navigation — active tab indicators, icon glow, FAB ring/shadow, backdrop blur, smooth transitions
- [x] **10.11** Build skeleton loading system:
  - Shimmer CSS animation (`@keyframes shimmer` + `.animate-shimmer`) in globals.css
  - Reusable `<Skeleton>` primitive component
  - Dashboard skeleton matching exact layout (hero, stats grid, chart + legend, recent transactions)
  - Expenses skeleton matching exact layout (mobile: date groups + cards, desktop: full table)
- [x] **10.12** Implement stale-while-revalidate caching — module-level data cache for both pages. Returning to a page shows cached data instantly, background refresh updates silently. No skeleton on return navigation.
- [x] **10.13** Polish loading flow — removed animation conflicts between auth spinner, skeletons, and content entrance. Fixed skeleton re-render jitter (static bar heights, no staggered delays).

**Deliverable:** Professional, responsive UI with interactive charts, smooth loading states, and modern mobile patterns. ✅

---

## Summary

| Phase | Name                      | Status   |
| ----- | ------------------------- | -------- |
| 1     | Scaffolding & DB Setup    | Complete |
| 2     | Backend Auth              | Complete |
| 3     | Backend Expenses          | Complete |
| 4     | Frontend Auth Pages       | Complete |
| 5     | Frontend Route Protection | Complete |
| 6     | Frontend Expense Pages    | Complete |
| 7     | Frontend Overview         | Complete |
| 8     | Polish & Final Touches    | Complete |
| 9     | Settings Page             | Complete |
| 10    | UI Overhaul & Modern Design | Complete |
