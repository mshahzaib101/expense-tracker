'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  ReceiptText,
  Calculator,
  ArrowRight,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api, ApiError, type Expense, type ExpenseSummary } from '@/lib/api';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth-provider';
import { useExpenseForm } from '@/components/expense-form-provider';
import {
  getDashboardCacheKey,
  readDashboardCache,
  writeDashboardCache,
  type DashboardPresetKey,
} from '@/lib/client-cache';
import { formatLocalRangeDate, getLocalRelativeDate, getLocalToday } from '@/lib/date';

type DatePreset = DashboardPresetKey;

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '3m', label: 'Last 3 Months' },
  { key: 'all', label: 'All Time' },
];

const VISIBLE_PRESET_KEYS: DatePreset[] = ['today', 'month', 'week'];
const MENU_PRESET_KEYS: DatePreset[] = ['yesterday', '30d', '3m', 'all'];

const VISIBLE_PRESETS = VISIBLE_PRESET_KEYS.map((key) => DATE_PRESETS.find((p) => p.key === key)!);
const MENU_PRESETS = MENU_PRESET_KEYS.map((key) => DATE_PRESETS.find((p) => p.key === key)!);

function getDateRange(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = getLocalToday();

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'yesterday':
      return { startDate: getLocalRelativeDate(-1), endDate: getLocalRelativeDate(-1) };
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case '3m': {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case 'all':
      return {};
  }
}

function getPreviousMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { startDate: formatLocalRangeDate(start), endDate: formatLocalRangeDate(end) };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl px-3 py-2 shadow-xl text-card-foreground">
      <p className="text-xs font-medium text-muted-foreground">{payload[0].name}</p>
      <p className="text-sm font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function groupRecentByDate(expenses: Expense[]) {
  const today = getLocalToday();
  const yesterday = getLocalRelativeDate(-1);
  const groups: { label: string; date: string; items: Expense[] }[] = [];
  const map = new Map<string, Expense[]>();

  for (const exp of expenses) {
    const key = exp.date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(exp);
  }

  for (const [date, items] of map) {
    let label = formatDate(date);
    if (date === today) label = 'Today';
    else if (date === yesterday) label = 'Yesterday';
    groups.push({ label, date, items });
  }

  return groups;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { openForm, onExpenseChange } = useExpenseForm();
  const [preset, setPreset] = useState<DatePreset>('month');
  const cacheKey = user ? getDashboardCacheKey(user.id, preset) : null;
  const cachedData = cacheKey ? readDashboardCache(cacheKey) : null;
  const [summary, setSummary] = useState<ExpenseSummary | null>(cachedData?.summary ?? null);
  const [prevSummary, setPrevSummary] = useState<ExpenseSummary | null>(cachedData?.prevSummary ?? null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>(cachedData?.recentExpenses ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasData = useRef(!!cachedData);

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    const nextCachedData = readDashboardCache(cacheKey);
    setSummary(nextCachedData?.summary ?? null);
    setPrevSummary(nextCachedData?.prevSummary ?? null);
    setRecentExpenses(nextCachedData?.recentExpenses ?? []);
    setLoading(!nextCachedData);
    setLoadError(null);
    hasData.current = !!nextCachedData;
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!user || !cacheKey) {
      return;
    }
    if (!hasData.current) setLoading(true);
    setLoadError(null);
    try {
      const range = getDateRange(preset);
      const params: Record<string, string> = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const prevRange = getPreviousMonthRange();

      const [sumData, prevData, recentData] = await Promise.all([
        api.expenses.summary(params),
        api.expenses.summary(prevRange),
        api.expenses.list({ page: '1', limit: '5' }),
      ]);

      setSummary(sumData);
      setPrevSummary(prevData);
      setRecentExpenses(recentData.expenses);
      writeDashboardCache(cacheKey, {
        summary: sumData,
        prevSummary: prevData,
        recentExpenses: recentData.expenses,
        preset,
      });
      hasData.current = true;
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Failed to load dashboard data. Please try again.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, preset, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return onExpenseChange(() => fetchData());
  }, [onExpenseChange, fetchData]);

  const chartData = useMemo(
    () =>
      summary?.byCategory.map((item) => ({
        name: CATEGORY_CONFIG[item.category]?.label || item.category,
        value: item.totalAmount,
        color: CATEGORY_CONFIG[item.category]?.chartColor || '#64748b',
        count: item.count,
      })) || [],
    [summary],
  );

  const topCategory = summary?.byCategory.length
    ? summary.byCategory.reduce((a, b) => (a.totalAmount > b.totalAmount ? a : b))
    : null;

  const avgPerExpense =
    summary && summary.expenseCount > 0 ? summary.totalAmount / summary.expenseCount : 0;

  const monthChange = useMemo(() => {
    if (!summary || !prevSummary || prevSummary.totalAmount === 0) return null;
    const pct = ((summary.totalAmount - prevSummary.totalAmount) / prevSummary.totalAmount) * 100;
    return pct;
  }, [summary, prevSummary]);

  const recentGroups = useMemo(() => groupRecentByDate(recentExpenses), [recentExpenses]);

  const miniChartData = useMemo(
    () =>
      summary?.byCategory.map((c) => ({
        name: CATEGORY_CONFIG[c.category]?.label || c.category,
        value: c.totalAmount,
        color: CATEGORY_CONFIG[c.category]?.chartColor || '#64748b',
      })) || [],
    [summary],
  );

  const firstName = user?.name.split(' ')[0] || 'there';
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const presetFromMenu = MENU_PRESET_KEYS.includes(preset);
  const menuSelectionLabel = DATE_PRESETS.find((p) => p.key === preset)?.label ?? 'More';

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Header: Greeting + Date Presets */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{currentMonth}</p>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight mt-0.5">
            Hello, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 hidden lg:block">
            Here&apos;s your spending overview
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {VISIBLE_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              className={cn(
                'shrink-0 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs font-semibold transition-all',
                preset === p.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {p.label}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                presetFromMenu
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {presetFromMenu ? menuSelectionLabel : 'More'}
              <ChevronDown className="size-3 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-44 p-1.5">
              {MENU_PRESETS.map((p) => (
                <DropdownMenuItem
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-[13px] font-medium"
                >
                  {p.label}
                  {preset === p.key && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Hero Card Skeleton */}
          <div className="rounded-2xl bg-linear-to-br from-[#2d1854]/80 to-[#1a0e2e]/80 p-5 lg:px-8 lg:py-7 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-20 rounded-md opacity-30" />
                <Skeleton className="h-10 lg:h-14 w-48 lg:w-64 rounded-xl opacity-20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-28 rounded-md opacity-20" />
                  <Skeleton className="h-6 w-36 rounded-full opacity-15" />
                </div>
              </div>
              <div className="mt-5 lg:mt-0 h-24 lg:h-32 lg:w-80">
                <div className="flex items-end gap-2 h-full">
                  {[65, 40, 80, 55, 90, 45].map((h, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-t-md opacity-15"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card shadow-sm p-3 lg:p-5 flex items-center gap-3 lg:block">
                <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl shrink-0 lg:mb-3" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-5 lg:h-7 w-20 lg:w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row Skeleton */}
          <div className="grid gap-4 lg:gap-5 lg:grid-cols-2">
            {/* Donut + Legend */}
            <div className="rounded-xl bg-card shadow-sm p-5 lg:p-6">
              <Skeleton className="h-3 w-36 rounded-md mb-5" />
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                <Skeleton className="w-[200px] h-[200px] rounded-full mx-auto lg:mx-0 shrink-0" />
                <div className="flex-1 mt-4 lg:mt-0 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16 rounded-md" />
                          <Skeleton className="h-3 w-14 rounded-md" />
                        </div>
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl bg-card shadow-sm p-5 lg:p-6">
              <div className="flex items-center justify-between mb-5">
                <Skeleton className="h-3 w-32 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 lg:p-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                      <Skeleton className="h-2.5 w-28 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : loadError ? (
        <div className="py-16 text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive/60" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Could not load dashboard</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {loadError}
          </p>
          <Button
            onClick={fetchData}
            variant="outline"
            className="mt-5 rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Hero Summary Card */}
          <div className="bg-linear-to-br from-[#2d1854] to-[#1a0e2e] rounded-2xl p-5 lg:px-8 lg:py-7 text-white relative overflow-hidden animate-fade-in-up stagger-1">
            <div className="absolute top-0 right-0 w-40 h-40 lg:w-56 lg:h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 lg:w-36 lg:h-36 bg-violet-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-violet-300/5 rounded-full hidden lg:block" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:gap-12">
              <div className="flex-1">
                <p className="text-white/50 text-xs lg:text-sm font-medium tracking-wide uppercase">
                  Outcome
                </p>
                <p className="text-3xl lg:text-5xl font-extrabold tabular-nums mt-1.5 tracking-tight">
                  {formatCurrency(summary?.totalAmount ?? 0)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-white/40 text-xs lg:text-sm">
                    {summary?.expenseCount ?? 0} transaction{(summary?.expenseCount ?? 0) !== 1 && 's'}
                  </p>
                  {monthChange !== null && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[11px] lg:text-xs font-semibold px-2.5 py-1 rounded-full',
                        monthChange > 0
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300',
                      )}
                    >
                      {monthChange > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(monthChange).toFixed(1)}% vs last month
                    </span>
                  )}
                </div>
              </div>

              {miniChartData.length > 0 && (
                <div className="mt-5 lg:mt-0 h-24 lg:h-32 lg:w-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miniChartData} barCategoryGap="18%" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 500 }}
                        interval={0}
                        tickFormatter={(v: string) => v.length > 6 ? v.slice(0, 5) + '…' : v}
                        dy={4}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.06)', radius: 4 }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10">
                              <p className="font-semibold">{d.name}</p>
                              <p className="text-white/60 mt-0.5">{formatCurrency(d.value)}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {miniChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
            <Card className="animate-fade-in-up stagger-2 border-none shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-violet-500/0" />
              <CardContent className="p-3 lg:p-5 relative flex items-center gap-3 lg:block">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-violet-100 flex items-center justify-center shrink-0 lg:mb-3 group-hover:scale-105 transition-transform">
                  <CircleDollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Total Spent</p>
                  <p className="text-base lg:text-2xl font-extrabold tabular-nums tracking-tight">
                    {formatCurrency(summary?.totalAmount ?? 0)}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 hidden lg:block">
                    Total Spent
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-2 border-none shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-blue-500/0" />
              <CardContent className="p-3 lg:p-5 relative flex items-center gap-3 lg:block">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 lg:mb-3 group-hover:scale-105 transition-transform">
                  <ReceiptText className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Transactions</p>
                  <p className="text-base lg:text-2xl font-extrabold tabular-nums tracking-tight">
                    {summary?.expenseCount ?? 0}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 hidden lg:block">
                    Transactions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-3 border-none shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-amber-500/0" />
              <CardContent className="p-3 lg:p-5 relative flex items-center gap-3 lg:block">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 lg:mb-3 group-hover:scale-105 transition-transform">
                  <Calculator className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Average</p>
                  <p className="text-base lg:text-2xl font-extrabold tabular-nums tracking-tight">
                    {formatCurrency(avgPerExpense)}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 hidden lg:block">
                    Average
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-3 border-none shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-emerald-500/0" />
              <CardContent className="p-3 lg:p-5 relative flex items-center gap-3 lg:block">
                {(() => {
                  const cfg = topCategory ? CATEGORY_CONFIG[topCategory.category] : null;
                  const Icon = cfg?.icon;
                  return (
                    <div className={cn('w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 lg:mb-3 group-hover:scale-105 transition-transform', cfg?.bgColor || 'bg-emerald-100')}>
                      {Icon ? <Icon className={cn('h-5 w-5 lg:h-6 lg:w-6', cfg?.color)} /> : <Calculator className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />}
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Top Category</p>
                  <p className="text-base lg:text-2xl font-extrabold tracking-tight truncate">
                    {topCategory ? CATEGORY_CONFIG[topCategory.category]?.label : '—'}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5 hidden lg:block">
                    Top Category
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:gap-5 lg:grid-cols-2">
            {/* Donut Chart + Category Legend */}
            <Card className="animate-fade-in-up stagger-3 border-none shadow-sm">
              <CardContent className="p-5 lg:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 lg:mb-5">
                  Spending Distribution
                </p>

                {chartData.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No spending data yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Add an expense to see your distribution</p>
                    <Button className="mt-5 rounded-xl shadow-md shadow-primary/20 px-6" onClick={() => openForm()}>
                      <CircleDollarSign className="h-4 w-4 mr-1.5" />
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                  <div className="relative shrink-0 mx-auto lg:mx-0">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 20 }} offset={15} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                          Total
                        </p>
                        <p className="text-base font-extrabold tabular-nums">
                          {formatCurrency(summary?.totalAmount ?? 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mt-4 lg:mt-0 space-y-2">
                    {(summary?.byCategory ?? []).map((item) => {
                      const config = CATEGORY_CONFIG[item.category];
                      const Icon = config?.icon;
                      const pct = (summary?.totalAmount ?? 0) > 0
                        ? (item.totalAmount / summary!.totalAmount) * 100
                        : 0;

                      return (
                        <div key={item.category} className="flex items-center gap-2.5 group">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                              config?.bgColor,
                            )}
                          >
                            {Icon && <Icon className={cn('h-4 w-4', config?.color)} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-semibold truncate">{config?.label}</span>
                              <span className="text-[13px] font-bold tabular-nums ml-2">
                                {formatCurrency(item.totalAmount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out"
                                  style={{ width: `${pct}%`, backgroundColor: config?.chartColor }}
                                />
                              </div>
                              <span className="text-[11px] font-semibold tabular-nums text-muted-foreground w-10 text-right">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="animate-fade-in-up stagger-4 border-none shadow-sm">
              <CardContent className="p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Transactions
                  </p>
                  <Link
                    href="/expenses"
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {recentExpenses.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <ReceiptText className="h-5 w-5 text-primary/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Your recent expenses will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentGroups.map((group) => (
                      <div key={group.date}>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          {group.label}
                        </p>
                        <div className="space-y-1">
                          {group.items.map((expense) => {
                            const config = CATEGORY_CONFIG[expense.category];
                            const Icon = config?.icon;
                            return (
                              <div
                                key={expense.id}
                                className="rounded-xl p-2.5 lg:p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                              >
                                <div
                                  className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                    config?.bgColor,
                                  )}
                                >
                                  {Icon && <Icon className={cn('h-5 w-5', config?.color)} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[13px] truncate">
                                    {config?.label}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {expense.note || 'No note'}
                                  </p>
                                </div>
                                <span className="font-bold text-sm tabular-nums shrink-0">
                                  {formatCurrency(expense.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
