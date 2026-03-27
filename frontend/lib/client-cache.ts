import type { Expense, ExpenseSummary, Pagination } from '@/lib/api';

export type DashboardPresetKey =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | '30d'
  | '3m'
  | 'all';

type DashboardCacheEntry = {
  summary: ExpenseSummary;
  prevSummary: ExpenseSummary;
  recentExpenses: Expense[];
  preset: DashboardPresetKey;
};

type ExpensesCacheEntry = {
  expenses: Expense[];
  pagination: Pagination | null;
};

const dashboardCache = new Map<string, DashboardCacheEntry>();
const expensesCache = new Map<string, ExpensesCacheEntry>();

function normalizeKeyPart(value: string) {
  return value || '__empty__';
}

export function getDashboardCacheKey(userId: string, preset: DashboardPresetKey) {
  return `${normalizeKeyPart(userId)}::${preset}`;
}

export function getExpensesCacheKey(input: {
  userId: string;
  categoryFilter: string;
  startDate: string;
  endDate: string;
  page: number;
}) {
  return [
    normalizeKeyPart(input.userId),
    normalizeKeyPart(input.categoryFilter),
    normalizeKeyPart(input.startDate),
    normalizeKeyPart(input.endDate),
    String(input.page),
  ].join('::');
}

export function readDashboardCache(key: string) {
  return dashboardCache.get(key) ?? null;
}

export function writeDashboardCache(key: string, value: DashboardCacheEntry) {
  dashboardCache.set(key, value);
}

export function readExpensesCache(key: string) {
  return expensesCache.get(key) ?? null;
}

export function writeExpensesCache(key: string, value: ExpensesCacheEntry) {
  expensesCache.set(key, value);
}

export function clearProtectedDataCache() {
  dashboardCache.clear();
  expensesCache.clear();
}
