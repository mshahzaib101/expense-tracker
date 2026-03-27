# Expense Tracker — Frontend

Next.js 16 application with Tailwind CSS v4, shadcn/ui, Recharts, and vaul.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Runs on **http://localhost:3000**. Requires the backend running on port 3001.

## Stack

| Library          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| Next.js 16       | App Router, middleware, SSR               |
| Tailwind CSS v4  | Styling (CSS-first config, oklch palette) |
| shadcn/ui        | Accessible UI primitives                  |
| Recharts         | PieChart, BarChart for dashboard          |
| vaul             | Bottom sheet drawers for mobile           |
| Lucide React     | Icon set                                  |
| React Hook Form  | Form state management                    |
| Zod              | Form + API validation schemas             |
| Sonner           | Toast notifications                       |

## Pages

| Route        | Description                                                |
| ------------ | ---------------------------------------------------------- |
| `/overview`  | Dashboard — hero card, stats grid, donut chart, recent txn |
| `/expenses`  | Transaction list — mobile cards, desktop table, filters    |
| `/settings`  | Profile, password, CSV export, account deletion            |
| `/login`     | Login with split-screen layout                             |
| `/register`  | Registration with split-screen layout                      |

## Key Patterns

- **Global expense form** — `ExpenseFormProvider` context renders one form instance; callable from sidebar, FAB, or any page
- **Module-level cache** — stale-while-revalidate pattern for instant page transitions
- **Portal date picker** — `createPortal` to `document.body` avoids drawer transform clipping
- **Centralized categories** — `lib/constants.ts` defines icons, colors, and formatters used everywhere
- **Responsive layout** — desktop sidebar + mobile bottom nav/FAB, managed in `(dashboard)/layout.tsx`
