# Expense Tracker — Project Overview

## Purpose

A full-stack expense tracking application where users can register, log in, and manage their daily expenses with an interactive dashboard, charts, filtering, and summary views. Built with Next.js and NestJS, with particular attention to responsive design and polished UX.

---

## Tech Stack

| Layer              | Technology                | Version  | Purpose                                      |
| ------------------ | ------------------------- | -------- | -------------------------------------------- |
| **Frontend**       | Next.js (App Router)      | 16.x     | React framework with SSR, middleware, routing |
| **Styling**        | Tailwind CSS              | 4.x      | Utility-first CSS with CSS-first config       |
| **UI Components**  | shadcn/ui                 | Latest   | Accessible, composable UI primitives          |
| **Charts**         | Recharts                  | Latest   | PieChart, BarChart, responsive containers     |
| **Mobile Drawers** | vaul                      | Latest   | Bottom sheet / drawer component for mobile    |
| **Icons**          | Lucide React              | Latest   | Modern, consistent icon set                   |
| **Fonts**          | Plus Jakarta Sans, JetBrains Mono | — | Primary + monospace via next/font/google      |
| **Backend**        | NestJS                    | 11.x     | Enterprise Node.js framework with DI          |
| **ORM**            | Prisma                    | Latest   | Type-safe database access and migrations      |
| **Database**       | PostgreSQL (Docker)       | 16       | Local relational database via Docker Compose  |
| **Auth**           | Passport JWT + Argon2id   | —        | JWT strategy with modern password hashing     |
| **Validation**     | Zod                       | Latest   | Runtime schema validation (shared FE/BE)      |
| **Package Manager**| npm                       | Latest   | Default Node.js package manager               |
| **Runtime**        | Node.js                   | 22 LTS   | JavaScript runtime                            |
| **Language**       | TypeScript                | 5.x      | Static typing across the entire stack         |

---

## Architecture

```
┌─────────────────────────────────┐
│          Next.js 16             │
│     (Frontend — Port 3000)      │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Next.js Middleware        │  │  ← Checks JWT cookie, redirects
│  │  (Route Protection)       │  │    unauthenticated users to /login
│  └───────────────────────────┘  │
│                                 │
│  Pages:                         │
│  • /login, /register            │  ← Split-screen auth layout
│  • /overview (dashboard home)   │  ← Charts, stats, recent expenses
│  • /expenses (transaction mgmt) │  ← CRUD, filtering, date grouping
│  • /settings (account mgmt)     │  ← Profile, password, export, delete
│                                 │
│  Layout:                        │
│  • Desktop: fixed sidebar nav   │
│  • Mobile: bottom tab bar + FAB │
│  • Global expense form provider │
└───────────────┬─────────────────┘
                │ HTTP requests (fetch)
                │ JWT sent via HTTP-only cookie
                ▼
┌─────────────────────────────────┐
│          NestJS 11              │
│     (Backend — Port 3001)       │
│                                 │
│  ┌───────────────────────────┐  │
│  │  JWT Auth Guard            │  │  ← Validates JWT on protected
│  │  (Passport Strategy)       │  │    API endpoints
│  └───────────────────────────┘  │
│                                 │
│  Modules:                       │
│  • AuthModule                   │
│  • UsersModule                  │
│  • ExpensesModule               │
│  • PrismaModule                 │
└───────────────┬─────────────────┘
                │ Prisma Client (TCP)
                ▼
┌─────────────────────────────────┐
│     PostgreSQL 16               │
│     (Docker Container)          │
│                                 │
│  Tables:                        │
│  • users                        │
│  • expenses                     │
└─────────────────────────────────┘
```

---

## Project Structure

```
expense-tracker/
├── docs/                              # Project documentation
│   ├── OVERVIEW.md                    # This file — tech stack, architecture
│   ├── API.md                         # API endpoint documentation
│   ├── DATABASE.md                    # Database schema and relationships
│   └── STEPS.md                       # Phased build plan with completion status
│
├── backend/                           # NestJS 11 application
│   ├── src/
│   │   ├── main.ts                    # App bootstrap, CORS, cookie parser
│   │   ├── app.module.ts              # Root module
│   │   ├── common/
│   │   │   ├── guards/                # JwtAuthGuard
│   │   │   ├── decorators/            # @CurrentUser() decorator
│   │   │   ├── pipes/                 # ZodValidationPipe
│   │   │   └── filters/               # Global exception filter
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts     # POST /auth/register, /login, /logout
│   │   │   ├── auth.service.ts        # Hash, verify, sign JWT, set cookie
│   │   │   ├── jwt.strategy.ts        # Passport JWT strategy (reads cookie)
│   │   │   └── auth.schemas.ts        # Zod schemas: RegisterDto, LoginDto
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts    # PATCH /users/profile, /password, DELETE /account
│   │   │   ├── users.service.ts       # findByEmail, findById, create, update, delete
│   │   │   └── users.schemas.ts       # Zod schemas for settings DTOs
│   │   ├── expenses/
│   │   │   ├── expenses.module.ts
│   │   │   ├── expenses.controller.ts # CRUD + summary + CSV export endpoints
│   │   │   ├── expenses.service.ts    # Business logic + Prisma queries
│   │   │   └── expenses.schemas.ts    # Zod schemas for expense DTOs
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts      # PrismaClient with PrismaPg adapter
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema definition
│   │   └── migrations/                # Auto-generated migration files
│   ├── prisma.config.ts               # Prisma v7 config (datasource URL)
│   ├── .env                           # DATABASE_URL, JWT_SECRET (git-ignored)
│   └── package.json
│
├── frontend/                          # Next.js 16 application
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Plus Jakarta Sans, JetBrains Mono, providers)
│   │   ├── globals.css                # Tailwind v4 @theme, oklch palette, shimmer animation
│   │   ├── page.tsx                   # Landing redirect → /overview or /login
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Login — split-screen layout
│   │   │   └── register/page.tsx      # Register — split-screen layout
│   │   └── (dashboard)/
│   │       ├── layout.tsx             # Dashboard shell (sidebar, mobile bottom nav, FAB, auth gate)
│   │       ├── overview/page.tsx      # Dashboard home — charts, stats grid, recent transactions
│   │       ├── expenses/page.tsx      # Expense list — mobile cards, desktop table, filters
│   │       └── settings/page.tsx      # Profile, password, export, delete account
│   ├── components/
│   │   ├── auth-provider.tsx          # Auth context (user state, login/logout)
│   │   ├── expense-form-provider.tsx  # Global expense form context (open from anywhere)
│   │   ├── expense-form-dialog.tsx    # Add/edit form (Drawer on mobile, Dialog on desktop)
│   │   ├── date-picker.tsx            # Custom portal-based calendar date picker
│   │   └── ui/                        # shadcn/ui components (18 components)
│   │       ├── skeleton.tsx           # Shimmer-animated skeleton primitive
│   │       ├── drawer.tsx             # Bottom sheet drawer (vaul)
│   │       ├── calendar.tsx           # Calendar component
│   │       ├── alert-dialog.tsx       # Confirmation dialogs
│   │       ├── dialog.tsx, card.tsx, table.tsx, button.tsx, input.tsx,
│   │       │   select.tsx, label.tsx, badge.tsx, separator.tsx,
│   │       │   popover.tsx, dropdown-menu.tsx, sonner.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── api.ts                     # Fetch wrapper + TypeScript types
│   │   ├── constants.ts               # Category config (icons, colors), date/currency formatters
│   │   ├── validators.ts              # Shared Zod schemas for forms
│   │   └── utils.ts                   # Utility functions (cn helper)
│   ├── middleware.ts                   # Route protection (cookie check → redirect)
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md                          # Setup instructions
```

---

## Key Design Decisions

| Decision                     | Choice              | Rationale                                                            |
| ---------------------------- | ------------------- | -------------------------------------------------------------------- |
| Password hashing             | Argon2id            | OWASP #1 recommendation (2026), GPU-resistant, memory-hard           |
| Token storage                | HTTP-only cookie    | Immune to XSS (JS can't read it), auto-sent by browser              |
| Token type                   | JWT (access only)   | Simple, stateless — no refresh token complexity for this scope       |
| Validation                   | Zod                 | Single library for both frontend forms and backend DTOs              |
| ORM                          | Prisma              | Type-safe, auto-generated types, migration system, NestJS standard   |
| Database host                | Docker PostgreSQL   | Self-contained, one-command setup, no external dependencies          |
| UI framework                 | shadcn/ui           | Accessible components, Tailwind-native, source code (not dependency) |
| Styling                      | Tailwind CSS v4     | CSS-first config, fast builds, industry standard                     |
| Charts                       | Recharts            | Lightweight, React-native, composable chart components               |
| Mobile drawers               | vaul                | Smooth gesture-driven bottom sheets, native feel on mobile           |
| Theme palette                | oklch values        | Perceptually uniform colors, better consistency than hex/hsl         |
| Date picker                  | Custom (portal)     | Avoids layout shift bugs with Popover; works inside drawers/dialogs  |
| Data caching                 | Module-level cache  | Instant page transitions without a library like SWR or React Query   |
| Expense form                 | Global context      | Open add/edit form from sidebar, FAB, or any page — single instance  |
| Monorepo structure           | Simple folders      | `frontend/` + `backend/` — no Turborepo/Nx overhead for this scope  |

---

## Frontend Architecture

### Responsive Layout Strategy
- **Desktop (lg+)**: Fixed left sidebar with navigation links and "Add Expense" button. Content fills remaining width.
- **Mobile (<lg)**: Top header with app title and user avatar. Bottom tab bar with Home/Expenses tabs and a centered floating action button (FAB) for adding expenses.

### Page Design

| Page        | Mobile                                          | Desktop                                          |
| ----------- | ----------------------------------------------- | ------------------------------------------------ |
| **Overview** | Hero card, 2×2 stats grid, donut chart, recent list | Hero card with mini bar chart, 4-col stats, side-by-side chart + transactions |
| **Expenses** | Date-grouped transaction cards, tap for detail drawer | Full data table with hover note tooltip, inline actions |
| **Settings** | Stacked section cards                           | Same layout with wider content area              |

### Loading States
- **Initial auth check**: Spinning border animation around Wallet icon (centered, full screen)
- **Page data loading**: Shimmer-animated skeletons that mirror the exact layout of each page
- **Return navigation**: Module-level cache shows previous data instantly; background refresh updates silently

### Key Components
- **ExpenseFormProvider**: React Context that renders a single `ExpenseFormDialog` at the dashboard layout level. Any component can call `openForm()` to trigger it. Subscribes pages to data refresh via `onExpenseChange`.
- **DatePicker**: Custom component using `createPortal` to render the calendar into `document.body`, avoiding clipping by parent transforms (vaul drawers). Auto-flips up/down based on viewport space.
- **Skeleton**: Lightweight primitive using a CSS shimmer gradient animation for loading states.

### Category System
Categories are centrally defined in `lib/constants.ts` with consistent Lucide icons, Tailwind color classes, and hex chart colors used throughout the entire app (forms, charts, transaction cards, tables, legends).

---

## Security Measures

- **Argon2id** password hashing (memory-hard, GPU-resistant)
- **HTTP-only, Secure, SameSite=Lax** cookies for JWT storage
- **JWT Auth Guard** on all protected NestJS endpoints
- **Ownership verification** — users can only access/modify their own expenses
- **Zod validation** on every API endpoint — never trust client input
- **CORS** restricted to frontend origin only
- **Helmet** middleware for HTTP security headers
- **@nestjs/throttler** tiered rate limiting — 10 req/min on auth and settings routes (brute-force protection), 100 req/min globally (abuse prevention)
- **Password re-verification** required for password change and account deletion
- **Forced re-login** after password change (defense-in-depth)
- **CSV injection prevention** on expense export (formula characters sanitized)
- **Next.js middleware** redirects unauthenticated users from dashboard routes

## Error Handling

- **Global exception filter** catches all errors and returns consistent JSON with user-friendly messages
- **Prisma errors** mapped to proper HTTP codes (duplicate → 409, not found → 404, DB down → 503)
- **Frontend API client** handles network failures, non-JSON responses, and server errors gracefully
- **Dedicated error states** on data pages with retry buttons — distinct from empty states
- **Segment error boundary** (`error.tsx`) and **root layout boundary** (`global-error.tsx`) catch render crashes
- **Toast notifications** for all user-facing errors with actionable messages

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
JWT_SECRET="a-strong-random-secret-min-32-chars"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```
