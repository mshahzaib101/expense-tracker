import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarRange,
  ChartNoAxesCombined,
  ShieldCheck,
  Wallet,
  House,
  Receipt,
  Plus,
  Settings,
  TrendingDown,
  CircleDollarSign,
  ReceiptText,
  Calculator,
  Tag,
  Layers,
  Download,
  BarChart3,
  Shield,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Expense Tracker | Professional Expense Tracking',
  description:
    'Track and manage your daily expenses with clear summaries, category-level visibility, and secure account access.',
};

const features = [
  {
    icon: BadgeDollarSign,
    title: 'Fast expense entry',
    description:
      'Record amount, category, date, and notes without losing time to spreadsheet maintenance.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Readable overview',
    description:
      'Understand totals and category breakdowns in a dashboard that stays calm and legible.',
  },
  {
    icon: CalendarRange,
    title: 'Practical filtering',
    description:
      'Narrow records by category or date range when you need answers instead of noise.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure sessions',
    description:
      'Protected routes and HTTP-only cookie auth keep your data safe and sessions stable.',
  },
];

const highlights = [
  { icon: Layers, value: '8', label: 'Expense Categories' },
  { icon: BarChart3, value: 'Live', label: 'Dashboard Analytics' },
  { icon: Download, value: 'CSV', label: 'Export Ready' },
  { icon: Shield, value: '100%', label: 'Secure Auth' },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      {/* ═══════════════ DARK HERO ═══════════════ */}
      <div className="relative bg-[oklch(0.135_0.06_281)] pb-32 sm:pb-40 lg:pb-56">
        {/* ── Animated Background Layers ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Morphing gradient blobs */}
          <div
            className="absolute -left-32 top-1/4 h-[500px] w-[500px] animate-morph-blob bg-violet-600/12 blur-[100px]"
            style={{ animationDuration: '10s' }}
          />
          <div
            className="absolute -right-24 top-0 h-[400px] w-[400px] animate-morph-blob bg-indigo-500/8 blur-[90px]"
            style={{ animationDelay: '3s', animationDuration: '12s' }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[350px] w-[350px] animate-morph-blob bg-purple-400/6 blur-[80px]"
            style={{ animationDelay: '6s', animationDuration: '14s' }}
          />
          <div
            className="absolute -bottom-20 right-1/4 h-[280px] w-[280px] animate-glow-breathe rounded-full bg-amber-500/4"
            style={{ animationDelay: '2s' }}
          />

          {/* Subtle animated grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'grid-scroll 8s linear infinite',
          }} />

          {/* Orbiting ring — large */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-rotate-slow h-[600px] w-[600px] rounded-full border border-dashed border-white/4 lg:h-[800px] lg:w-[800px]" />
          </div>
          {/* Orbiting ring — small */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[300px] w-[300px] rounded-full border border-white/3 lg:h-[450px] lg:w-[450px]" style={{ animation: 'rotate-slow 22s linear infinite reverse' }} />
          </div>

          {/* Floating geometric accents */}
          <div className="animate-drift-x absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-violet-400/30" style={{ animationDuration: '15s' }} />
          <div className="animate-drift-y absolute right-[15%] top-[20%] h-1.5 w-1.5 rounded-full bg-indigo-300/25" style={{ animationDuration: '11s' }} />
          <div className="animate-drift-x absolute left-[25%] top-[70%] h-3 w-3 rounded-full bg-purple-400/15" style={{ animationDelay: '4s', animationDuration: '18s' }} />
          <div className="animate-drift-y absolute right-[20%] top-[65%] h-1 w-1 rounded-full bg-violet-300/40" style={{ animationDelay: '2s', animationDuration: '9s' }} />
          <div className="animate-drift-x absolute left-[65%] top-[30%] h-2.5 w-2.5 rounded-full bg-white/10" style={{ animationDelay: '7s', animationDuration: '14s' }} />

          {/* Sparkle dots */}
          <div className="animate-sparkle absolute left-[18%] top-[35%] h-1 w-1 rounded-full bg-white/60" style={{ animationDelay: '0s', animationDuration: '4s' }} />
          <div className="animate-sparkle absolute left-[72%] top-[18%] h-1 w-1 rounded-full bg-violet-300/60" style={{ animationDelay: '1.3s', animationDuration: '3.5s' }} />
          <div className="animate-sparkle absolute left-[45%] top-[75%] h-0.5 w-0.5 rounded-full bg-white/50" style={{ animationDelay: '2.5s', animationDuration: '5s' }} />
          <div className="animate-sparkle absolute left-[85%] top-[55%] h-1 w-1 rounded-full bg-indigo-300/50" style={{ animationDelay: '0.7s', animationDuration: '4.5s' }} />
          <div className="animate-sparkle absolute left-[8%] top-[60%] h-0.5 w-0.5 rounded-full bg-white/40" style={{ animationDelay: '3.2s', animationDuration: '3.8s' }} />

          {/* Floating diamond shapes */}
          <div className="animate-drift-y absolute left-[5%] top-[45%] h-3 w-3 rotate-45 rounded-sm border border-violet-400/15" style={{ animationDuration: '13s', animationDelay: '1s' }} />
          <div className="animate-drift-x absolute right-[8%] top-[40%] h-4 w-4 rotate-45 rounded-sm border border-indigo-400/10" style={{ animationDuration: '16s', animationDelay: '5s' }} />
          <div className="animate-drift-y absolute left-[55%] top-[12%] h-2 w-2 rotate-45 rounded-sm border border-white/8" style={{ animationDuration: '10s', animationDelay: '3s' }} />

          {/* Orbiting particles on the large ring */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit h-0 w-0" style={{ '--orbit-r': '300px', '--orbit-dur': '25s' } as React.CSSProperties}>
              <div className="h-2 w-2 rounded-full bg-violet-400/40 shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit h-0 w-0" style={{ '--orbit-r': '220px', '--orbit-dur': '18s', animationDirection: 'reverse', animationDelay: '5s' } as React.CSSProperties}>
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-300/30" />
            </div>
          </div>
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit h-0 w-0" style={{ '--orbit-r': '400px', '--orbit-dur': '35s', animationDelay: '10s' } as React.CSSProperties}>
              <div className="h-1 w-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>

        {/* Grain overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]"
          aria-hidden="true"
        >
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          {/* ── Navigation ── */}
          <header className="animate-fade-in-up pt-5">
            <nav className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/3 px-4 py-3 backdrop-blur-xl sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-sidebar-primary to-violet-400 shadow-lg shadow-violet-500/20">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <span className="hidden text-sm font-bold tracking-tight text-white sm:block">
                  Expense Tracker
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Register
                </Link>
              </div>
            </nav>
          </header>

          {/* ── Hero Content ── */}
          <div className="pt-16 text-center sm:pt-20 lg:pt-28">
            {/* Glowing badge */}
            <div className="animate-fade-in-up stagger-1 mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-violet-300">
                Expense Tracking
              </span>
            </div>

            <h1 className="animate-fade-in-up stagger-2 mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span className="animate-text-shimmer bg-linear-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                Track spending with clarity,
              </span>
              <br />
              <span className="text-white">
                not complexity.
              </span>
            </h1>

            <p className="animate-fade-in-up stagger-3 mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45 sm:text-lg sm:leading-8">
              A focused expense tracker with clean summaries, category-level visibility, and the
              calm interface your financial workflow deserves.
            </p>

            <div className="animate-fade-in-up stagger-4 mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-7 text-sm font-bold text-[oklch(0.135_0.06_281)] shadow-[0_8px_32px_rgba(255,255,255,0.12)] transition-all duration-300 hover:shadow-[0_8px_48px_rgba(255,255,255,0.22)]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-violet-200/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">Get Started Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/4 px-7 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                Sign In
              </Link>
            </div>

            <div className="animate-fade-in-up stagger-5 mt-12 flex flex-wrap items-center justify-center gap-3">
              {[
                { value: '8', label: 'Categories' },
                { value: 'Live', label: 'Dashboard' },
                { value: 'CSV', label: 'Export' },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="group flex items-center gap-2 rounded-full border border-white/6 bg-white/3 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/8"
                >
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-violet-200">{pill.value}</span>
                  <span className="text-xs text-white/40">{pill.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade into showcase */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* ═══════════════ PRODUCT SHOWCASE ═══════════════ */}
      <section
        id="preview"
        className="relative z-20 mx-auto -mt-16 max-w-7xl px-5 pb-24 sm:-mt-24 sm:px-8 lg:-mt-40 lg:px-10 lg:pb-32"
      >
        <div className="relative animate-scale-in" style={{ perspective: '1200px' }}>
          {/* ── Desktop Browser Mockup ── */}
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0 scrollbar-hide">
          <div
            className="min-w-[600px] overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)]"
            style={{ transform: 'rotateX(2deg)' }}
            aria-hidden="true"
          >
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-[oklch(0.16_0.065_281)] px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57] sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e] sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
                <span className="h-2 w-2 rounded-full bg-[#28c840] sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
              </div>
              <div className="mx-6 flex-1 sm:mx-12 lg:mx-28">
                <div className="rounded-md bg-white/5 px-3 py-1 text-center sm:rounded-lg sm:px-4 sm:py-1.5 lg:py-2">
                  <span className="font-mono text-[9px] tracking-wide text-white/30 sm:text-[11px] lg:text-[13px]">
                    expense-tracker.app/overview
                  </span>
                </div>
              </div>
              <div className="w-10 sm:w-16" />
            </div>

            {/* App: Sidebar + Content */}
            <div className="flex min-h-[340px] sm:min-h-[400px] lg:min-h-[520px]">
              {/* Sidebar */}
              <div className="flex w-[48px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar sm:w-[56px] lg:w-[210px]">
                <div className="flex h-[42px] items-center gap-2.5 border-b border-sidebar-border px-2 lg:h-[56px] lg:px-4">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sidebar-primary to-violet-400 shadow-md shadow-violet-500/20 lg:h-7 lg:w-7">
                    <Wallet className="h-2.5 w-2.5 text-white lg:h-3.5 lg:w-3.5" />
                  </div>
                  <span className="hidden text-[11px] font-bold tracking-tight text-sidebar-foreground lg:block">
                    Expense Tracker
                  </span>
                </div>

                <div className="px-1.5 pb-1 pt-2.5 lg:px-3 lg:pt-4">
                  <div className="flex h-6 items-center justify-center gap-1.5 rounded-lg bg-sidebar-primary text-[8px] font-semibold text-white shadow-md shadow-sidebar-primary/25 lg:h-9 lg:text-[11px]">
                    <Plus className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" strokeWidth={2.5} />
                    <span className="hidden lg:inline">Add Expense</span>
                  </div>
                </div>

                <div className="flex-1 space-y-0.5 px-1.5 pt-1.5 lg:px-3 lg:pt-3">
                  <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-1.5 py-[6px] text-[8px] font-medium text-sidebar-primary shadow-sm lg:gap-3 lg:px-3 lg:py-2 lg:text-[11px]">
                    <House className="h-3 w-3 shrink-0 lg:h-4 lg:w-4" />
                    <span className="hidden lg:inline">Home</span>
                  </div>
                  <div className="flex items-center gap-2 px-1.5 py-[6px] text-[8px] text-sidebar-foreground/40 lg:gap-3 lg:px-3 lg:py-2 lg:text-[11px]">
                    <Receipt className="h-3 w-3 shrink-0 lg:h-4 lg:w-4" />
                    <span className="hidden lg:inline">Expenses</span>
                  </div>
                  <div className="flex items-center gap-2 px-1.5 py-[6px] text-[8px] text-sidebar-foreground/40 lg:gap-3 lg:px-3 lg:py-2 lg:text-[11px]">
                    <Settings className="h-3 w-3 shrink-0 lg:h-4 lg:w-4" />
                    <span className="hidden lg:inline">Settings</span>
                  </div>
                </div>

                <div className="border-t border-sidebar-border px-1.5 py-2 lg:px-3 lg:py-3">
                  <div className="flex items-center gap-2 px-1 lg:px-1.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-[6px] font-bold text-sidebar-primary lg:h-7 lg:w-7 lg:text-[9px]">
                      J
                    </div>
                    <div className="hidden min-w-0 lg:block">
                      <p className="truncate text-[10px] font-semibold text-sidebar-foreground">
                        John Doe
                      </p>
                      <p className="truncate text-[7px] text-sidebar-foreground/35">
                        john@email.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden bg-background p-3 sm:p-4 lg:p-7">
                <div className="mb-2 flex items-end justify-between sm:mb-3 lg:mb-5">
                  <div>
                    <p className="text-[6px] font-medium text-muted-foreground sm:text-[7px] lg:text-[10px]">March 2026</p>
                    <h2 className="text-[11px] font-extrabold tracking-tight text-foreground sm:text-[14px] lg:text-[18px]">
                      Hello, John
                    </h2>
                    <p className="mt-0.5 hidden text-[7px] text-muted-foreground lg:block lg:text-[10px]">
                      Here&apos;s your spending overview
                    </p>
                  </div>
                  <div className="flex gap-1 lg:gap-1.5">
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[6px] font-semibold text-primary-foreground sm:px-2 sm:text-[7px] lg:px-3 lg:py-1 lg:text-[9px]">
                      This Month
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[6px] font-semibold text-muted-foreground sm:px-2 sm:text-[7px] lg:px-3 lg:py-1 lg:text-[9px]">
                      Today
                    </span>
                    <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[7px] font-semibold text-muted-foreground lg:inline-flex lg:px-3 lg:py-1 lg:text-[9px]">
                      This Week
                    </span>
                    <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[7px] font-semibold text-muted-foreground lg:inline-flex lg:px-3 lg:py-1 lg:text-[9px]">
                      More
                    </span>
                  </div>
                </div>

                {/* Hero Summary Card */}
                <div className="relative mb-2 overflow-hidden rounded-xl bg-linear-to-br from-[#2d1854] to-[#1a0e2e] p-2.5 text-white sm:mb-3 sm:p-3 lg:mb-4 lg:p-5">
                  <div className="absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/4" />
                  <div className="absolute bottom-0 left-0 h-12 w-12 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-400/6" />
                  <div className="relative flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[6px] font-medium uppercase tracking-wider text-white/45 sm:text-[7px] lg:text-[9px]">
                        Outcome
                      </p>
                      <p className="mt-0.5 text-[16px] font-extrabold tabular-nums tracking-tight sm:text-[20px] lg:text-[30px]">
                        $4,280
                      </p>
                      <div className="mt-1 flex items-center gap-2 sm:mt-1.5 lg:mt-2">
                        <p className="text-[6px] text-white/35 sm:text-[7px] lg:text-[9px]">12 transactions</p>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[5px] font-semibold text-emerald-300 sm:text-[6px] lg:text-[8px]">
                          <TrendingDown className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                          8.2% vs last month
                        </span>
                      </div>
                    </div>
                    <div className="flex h-12 shrink-0 items-end gap-[2px] sm:h-14 sm:gap-[3px] lg:h-[88px] lg:gap-1">
                      <div className="w-[8px] rounded-t-sm bg-chart-1 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '55%' }} />
                      <div className="w-[8px] rounded-t-sm bg-chart-2 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '38%' }} />
                      <div className="w-[8px] rounded-t-sm bg-chart-3 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '72%' }} />
                      <div className="w-[8px] rounded-t-sm bg-chart-4 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '28%' }} />
                      <div className="w-[8px] rounded-t-sm bg-chart-6 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '48%' }} />
                      <div className="w-[8px] rounded-t-sm bg-chart-7 opacity-80 sm:w-[10px] lg:w-3.5" style={{ height: '62%' }} />
                    </div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="mb-2 grid grid-cols-4 gap-1 sm:mb-3 sm:gap-1.5 lg:mb-4 lg:gap-3">
                  <div className="group rounded-lg border border-border/50 bg-card p-1.5 sm:p-2 lg:p-3">
                    <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-violet-100 text-violet-600 sm:mb-1.5 sm:h-5 sm:w-5 lg:mb-2 lg:h-7 lg:w-7 lg:rounded-lg">
                      <CircleDollarSign className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                    </div>
                    <p className="text-[8px] font-extrabold tabular-nums text-foreground sm:text-[9px] lg:text-[13px]">$4,280</p>
                    <p className="mt-0.5 text-[5px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[6px] lg:text-[8px]">Total Spent</p>
                  </div>
                  <div className="group rounded-lg border border-border/50 bg-card p-1.5 sm:p-2 lg:p-3">
                    <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-blue-100 text-blue-600 sm:mb-1.5 sm:h-5 sm:w-5 lg:mb-2 lg:h-7 lg:w-7 lg:rounded-lg">
                      <ReceiptText className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                    </div>
                    <p className="text-[8px] font-extrabold tabular-nums text-foreground sm:text-[9px] lg:text-[13px]">12</p>
                    <p className="mt-0.5 text-[5px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[6px] lg:text-[8px]">Transactions</p>
                  </div>
                  <div className="group rounded-lg border border-border/50 bg-card p-1.5 sm:p-2 lg:p-3">
                    <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-amber-100 text-amber-600 sm:mb-1.5 sm:h-5 sm:w-5 lg:mb-2 lg:h-7 lg:w-7 lg:rounded-lg">
                      <Calculator className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                    </div>
                    <p className="text-[8px] font-extrabold tabular-nums text-foreground sm:text-[9px] lg:text-[13px]">$356</p>
                    <p className="mt-0.5 text-[5px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[6px] lg:text-[8px]">Average</p>
                  </div>
                  <div className="group rounded-lg border border-border/50 bg-card p-1.5 sm:p-2 lg:p-3">
                    <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 sm:mb-1.5 sm:h-5 sm:w-5 lg:mb-2 lg:h-7 lg:w-7 lg:rounded-lg">
                      <Tag className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3.5 lg:w-3.5" />
                    </div>
                    <p className="text-[8px] font-extrabold tabular-nums text-foreground sm:text-[9px] lg:text-[13px]">Food</p>
                    <p className="mt-0.5 text-[5px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[6px] lg:text-[8px]">Top Category</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-1 sm:gap-1.5 lg:gap-3">
                  <div className="rounded-lg border border-border/50 bg-card p-2 sm:p-2.5 lg:p-4">
                    <p className="mb-2 text-[6px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2.5 sm:text-[7px] lg:mb-3 lg:text-[9px]">
                      Spending Distribution
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div
                        className="relative h-[40px] w-[40px] shrink-0 rounded-full sm:h-[52px] sm:w-[52px] lg:h-20 lg:w-20"
                        style={{
                          background:
                            'conic-gradient(var(--chart-1) 0deg 90deg, var(--chart-2) 90deg 155deg, var(--chart-3) 155deg 225deg, var(--chart-4) 225deg 280deg, var(--chart-6) 280deg 360deg)',
                        }}
                      >
                        <div className="absolute inset-[5px] rounded-full bg-card sm:inset-[6px] lg:inset-[9px]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 lg:space-y-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-chart-1 sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2" />
                          <span className="flex-1 truncate text-[6px] text-foreground/70 sm:text-[7px] lg:text-[9px]">Food</span>
                          <span className="tabular-nums text-[6px] font-medium text-muted-foreground sm:text-[7px] lg:text-[9px]">30%</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-chart-2 sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2" />
                          <span className="flex-1 truncate text-[6px] text-foreground/70 sm:text-[7px] lg:text-[9px]">Transport</span>
                          <span className="tabular-nums text-[6px] font-medium text-muted-foreground sm:text-[7px] lg:text-[9px]">22%</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-chart-3 sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2" />
                          <span className="flex-1 truncate text-[6px] text-foreground/70 sm:text-[7px] lg:text-[9px]">Shopping</span>
                          <span className="tabular-nums text-[6px] font-medium text-muted-foreground sm:text-[7px] lg:text-[9px]">20%</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-chart-4 sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2" />
                          <span className="flex-1 truncate text-[6px] text-foreground/70 sm:text-[7px] lg:text-[9px]">Bills</span>
                          <span className="tabular-nums text-[6px] font-medium text-muted-foreground sm:text-[7px] lg:text-[9px]">16%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-card p-2 sm:p-2.5 lg:p-4">
                    <div className="mb-2 flex items-center justify-between sm:mb-2.5 lg:mb-3">
                      <p className="text-[6px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[7px] lg:text-[9px]">
                        Recent
                      </p>
                      <span className="text-[6px] font-medium text-primary sm:text-[7px] lg:text-[9px]">View all</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                      {[
                        { label: 'Grocery Store', amount: '-$84.20', color: 'bg-chart-1' },
                        { label: 'Uber Ride', amount: '-$24.50', color: 'bg-chart-2' },
                        { label: 'Netflix Sub', amount: '-$15.99', color: 'bg-chart-3' },
                        { label: 'Coffee Shop', amount: '-$6.40', color: 'bg-chart-4' },
                      ].map((tx) => (
                        <div key={tx.label} className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-md bg-muted/50 sm:h-4 sm:w-4 lg:h-6 lg:w-6">
                            <div className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 lg:h-2 lg:w-2 ${tx.color}`} />
                          </div>
                          <span className="flex-1 truncate text-[6px] text-foreground/80 sm:text-[7px] lg:text-[9px]">
                            {tx.label}
                          </span>
                          <span className="tabular-nums text-[6px] font-semibold text-foreground sm:text-[7px] lg:text-[9px]">
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* ── Phone Mockup ── */}
          <div className="relative z-30 -mt-[75%] mr-4 flex justify-end sm:-mt-[70%] sm:mr-8 md:absolute md:-bottom-12 md:right-4 md:mt-0 lg:-bottom-8 lg:right-8">
            <div
              className="w-[200px] animate-float overflow-hidden rounded-[28px] border-[5px] border-foreground/8 bg-background shadow-[0_24px_60px_rgba(0,0,0,0.18)] lg:w-[240px] lg:rounded-[34px] lg:border-[6px]"
              aria-hidden="true"
            >
              {/* Notch */}
              <div className="flex h-5 items-center justify-center bg-background lg:h-6">
                <div className="h-3 w-16 rounded-full bg-foreground/4 lg:h-3.5 lg:w-20" />
              </div>

              {/* Mobile Header */}
              <div className="flex items-center justify-between px-3 py-1.5 lg:px-4 lg:py-2">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-linear-to-br from-primary to-violet-400 lg:h-6 lg:w-6">
                    <Wallet className="h-2.5 w-2.5 text-white lg:h-3 lg:w-3" />
                  </div>
                  <span className="text-[8px] font-bold tracking-tight text-foreground lg:text-[10px]">
                    Expense Tracker
                  </span>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary lg:h-6 lg:w-6 lg:text-[8px]">
                  J
                </div>
              </div>

              {/* Greeting */}
              <div className="px-3 pt-1.5 lg:px-4 lg:pt-2">
                <p className="text-[6px] font-medium text-muted-foreground lg:text-[7px]">March 2026</p>
                <p className="text-[11px] font-extrabold tracking-tight text-foreground lg:text-[13px]">
                  Hello, John
                </p>
              </div>

              {/* Date pills */}
              <div className="flex gap-1 px-3 py-1.5 lg:gap-1.5 lg:px-4 lg:py-2">
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[6px] font-semibold text-primary-foreground lg:px-2 lg:text-[7px]">
                  This Month
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[6px] font-semibold text-muted-foreground lg:px-2 lg:text-[7px]">
                  Today
                </span>
              </div>

              {/* Hero Card */}
              <div className="relative mx-3 overflow-hidden rounded-xl bg-linear-to-br from-[#2d1854] to-[#1a0e2e] p-2.5 text-white lg:mx-4 lg:p-3">
                <div className="absolute right-0 top-0 h-10 w-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/4" />
                <p className="text-[6px] font-medium uppercase tracking-wider text-white/45 lg:text-[7px]">
                  Outcome
                </p>
                <p className="mt-0.5 text-[16px] font-extrabold tabular-nums tracking-tight lg:text-[19px]">
                  $4,280
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="text-[6px] text-white/35 lg:text-[7px]">12 transactions</p>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1 py-0.5 text-[5px] font-semibold text-emerald-300 lg:text-[6px]">
                    <TrendingDown className="h-1.5 w-1.5" />
                    8.2%
                  </span>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-1 px-3 py-2 lg:gap-1.5 lg:px-4 lg:py-2.5">
                <div className="rounded-lg border border-border/50 bg-card p-1.5 lg:p-2">
                  <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-violet-100 text-violet-600 lg:h-5 lg:w-5">
                    <CircleDollarSign className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  </div>
                  <p className="text-[8px] font-extrabold tabular-nums text-foreground lg:text-[9px]">$4,280</p>
                  <p className="text-[5px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-[6px]">
                    Total
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-1.5 lg:p-2">
                  <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-blue-100 text-blue-600 lg:h-5 lg:w-5">
                    <ReceiptText className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  </div>
                  <p className="text-[8px] font-extrabold tabular-nums text-foreground lg:text-[9px]">12</p>
                  <p className="text-[5px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-[6px]">
                    Count
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-1.5 lg:p-2">
                  <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-amber-100 text-amber-600 lg:h-5 lg:w-5">
                    <Calculator className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  </div>
                  <p className="text-[8px] font-extrabold tabular-nums text-foreground lg:text-[9px]">$356</p>
                  <p className="text-[5px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-[6px]">
                    Average
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card p-1.5 lg:p-2">
                  <div className="mb-1 flex h-4 w-4 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 lg:h-5 lg:w-5">
                    <Tag className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                  </div>
                  <p className="text-[8px] font-extrabold tabular-nums text-foreground lg:text-[9px]">Food</p>
                  <p className="text-[5px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-[6px]">
                    Top
                  </p>
                </div>
              </div>

              <div className="h-6 lg:h-8" />

              {/* Bottom Nav */}
              <div className="relative flex items-center justify-around border-t border-border/50 bg-card/95 px-5 py-2 backdrop-blur-sm lg:px-6 lg:py-2.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="rounded-lg bg-primary/10 p-1">
                    <House className="h-3.5 w-3.5 text-primary lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-[5px] font-bold text-primary lg:text-[6px]">Home</span>
                </div>

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 lg:-top-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-500 text-primary-foreground shadow-lg shadow-primary/25 ring-[3px] ring-background lg:h-10 lg:w-10 lg:ring-4">
                    <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="p-1">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground/40 lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-[5px] font-bold text-muted-foreground/40 lg:text-[6px]">Expenses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES + STATS ═══════════════ */}
      <section
        id="features"
        className="relative overflow-hidden bg-[oklch(0.135_0.06_281)] py-20 text-white sm:py-24 lg:py-32"
      >
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] animate-pulse-glow rounded-full bg-violet-600/8 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-indigo-500/6 blur-[100px]" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-purple-500/5 blur-[80px]" style={{ animationDelay: '3.5s' }} />
        </div>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.02]"
          aria-hidden="true"
        >
          <filter id="grainFeatures">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainFeatures)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          {/* Section header */}
          <div className="mb-14 text-center lg:mb-20">
            <div className="animate-fade-in-up mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 text-violet-300 sm:h-6 sm:w-6" />
            </div>
            <h2 className="animate-fade-in-up stagger-1 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Everything you need,<br className="hidden sm:block" /> nothing you don&apos;t
            </h2>
            <p className="animate-fade-in-up stagger-2 mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/40 sm:text-base">
              Built for people who want a clear view of their spending without the overhead of
              enterprise tools.
            </p>
          </div>

          {/* Feature cards — staggered grid */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5">
            {features.map((item, i) => (
              <div
                key={item.title}
                className={`animate-fade-in-up stagger-${i + 1} group relative overflow-hidden rounded-2xl border border-white/6 bg-white/3 p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/12 hover:bg-white/6 hover:shadow-[0_0_40px_rgba(139,92,246,0.08)] sm:p-7 lg:p-8`}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/4 transition-all duration-500 group-hover:scale-[2] group-hover:bg-violet-500/6" />

                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-white/10 transition-all duration-300 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 group-hover:shadow-lg group-hover:shadow-violet-500/10 sm:h-14 sm:w-14">
                    <item.icon className="h-5 w-5 text-violet-300 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold tracking-tight sm:text-base lg:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/35 sm:mt-2 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider line with glow */}
          <div className="relative my-14 flex items-center justify-center lg:my-20">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
            <div className="mx-4 h-1.5 w-1.5 rotate-45 rounded-sm bg-violet-400/50" />
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {highlights.map((item, i) => (
              <div
                key={item.label}
                className={`animate-count-up stagger-${i + 1} group flex flex-col items-center rounded-2xl border border-white/5 bg-white/2 py-6 text-center backdrop-blur-sm transition-all duration-500 hover:border-white/10 hover:bg-white/5 sm:py-8`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/15 to-indigo-500/15 ring-1 ring-white/8 transition-all duration-300 group-hover:ring-white/15 group-hover:shadow-lg group-hover:shadow-violet-500/10 sm:mb-4 sm:h-12 sm:w-12">
                  <item.icon className="h-5 w-5 text-violet-300 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <p className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[32px]">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-white/30 sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative overflow-hidden bg-[oklch(0.135_0.06_281)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.025]"
          aria-hidden="true"
        >
          <filter id="grain2">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain2)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 lg:px-10 lg:py-24">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Start tracking your expenses today
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/45">
            Create an account in seconds. No credit card required, no complex setup. Just clarity.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[oklch(0.135_0.06_281)] shadow-[0_8px_32px_rgba(255,255,255,0.1)] transition hover:bg-white/95 hover:shadow-[0_8px_40px_rgba(255,255,255,0.16)]"
          >
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-violet-400">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">Expense Tracker</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Register
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Expense Tracker
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
