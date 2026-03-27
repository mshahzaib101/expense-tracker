'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, SlidersHorizontal, Search, AlertCircle, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { api, ApiError, type Expense, type Pagination } from '@/lib/api';
import { CATEGORIES } from '@/lib/validators';
import { CATEGORY_CONFIG, CATEGORY_LIST, formatCurrency, formatDate } from '@/lib/constants';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useExpenseForm } from '@/components/expense-form-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  getExpensesCacheKey,
  readExpensesCache,
  writeExpensesCache,
} from '@/lib/client-cache';
import { getLocalRelativeDate, getLocalToday } from '@/lib/date';
import { useAuth } from '@/components/auth-provider';

function groupExpensesByDate(expenses: Expense[]) {
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

export default function ExpensesPage() {
  const { user } = useAuth();
  const { openForm, onExpenseChange } = useExpenseForm();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const cacheKey = user
    ? getExpensesCacheKey({
        userId: user.id,
        categoryFilter,
        startDate,
        endDate,
        page,
      })
    : null;
  const cachedData = cacheKey ? readExpensesCache(cacheKey) : null;
  const [expenses, setExpenses] = useState<Expense[]>(cachedData?.expenses ?? []);
  const [pagination, setPagination] = useState<Pagination | null>(cachedData?.pagination ?? null);
  const [loading, setLoading] = useState(!cachedData);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const hasData = useRef(!!cachedData);

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    const nextCachedData = readExpensesCache(cacheKey);
    setExpenses(nextCachedData?.expenses ?? []);
    setPagination(nextCachedData?.pagination ?? null);
    setLoading(!nextCachedData);
    setLoadError(null);
    hasData.current = !!nextCachedData;
  }, [cacheKey]);

  const hasFilters = categoryFilter || startDate || endDate;

  const fetchExpenses = useCallback(async () => {
    if (!user || !cacheKey) {
      return;
    }
    if (!hasData.current) setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const expData = await api.expenses.list(params);
      setExpenses(expData.expenses);
      setPagination(expData.pagination);
      writeExpensesCache(cacheKey, {
        expenses: expData.expenses,
        pagination: expData.pagination,
      });
      hasData.current = true;
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Failed to load expenses. Please try again.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, categoryFilter, endDate, page, startDate, user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    return onExpenseChange(() => fetchExpenses());
  }, [onExpenseChange, fetchExpenses]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.expenses.delete(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      fetchExpenses();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleFilterReset() {
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  const dateGroups = groupExpensesByDate(expenses);

  return (
    <div className="space-y-5">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between animate-fade-in-up">
        <h1 className="text-xl font-extrabold tracking-tight">Expenses</h1>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 rounded-lg relative',
            hasFilters && 'border-primary/30 bg-primary/5 text-primary',
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
          Filters
          {hasFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage your spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 rounded-lg relative',
              hasFilters && 'border-primary/30 bg-primary/5 text-primary',
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Filters
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
          <Button
            onClick={() => openForm()}
            className="h-9 rounded-lg shadow-md shadow-primary/20 font-semibold text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Category Filter Chips (Mobile) */}
      <div className="lg:hidden animate-fade-in-up stagger-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          <button
            onClick={() => {
              setCategoryFilter('');
              setPage(1);
            }}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
              !categoryFilter
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground',
            )}
          >
            All
          </button>
          {CATEGORY_LIST.map((cat) => {
            const isActive = categoryFilter === cat.value;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategoryFilter(isActive ? '' : cat.value);
                  setPage(1);
                }}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-muted text-muted-foreground',
                )}
                style={isActive ? { backgroundColor: cat.chartColor } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="lg:hidden animate-fade-in-up bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date Range
            </p>
            {hasFilters && (
              <button
                onClick={handleFilterReset}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <DatePicker
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  setPage(1);
                }}
                placeholder="Start date"
                className="h-9 text-xs"
                clearable
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <DatePicker
                value={endDate}
                onChange={(v) => {
                  setEndDate(v);
                  setPage(1);
                }}
                placeholder="End date"
                className="h-9 text-xs"
                clearable
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      {showFilters && (
        <div className="hidden lg:block animate-fade-in-up bg-card rounded-xl border p-4 space-y-3 relative z-20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filters
            </p>
            {hasFilters && (
              <button
                onClick={handleFilterReset}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select
                value={categoryFilter || 'ALL'}
                onValueChange={(v) => {
                  setCategoryFilter(v === 'ALL' ? '' : (v ?? ''));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 bg-muted/50 border-transparent text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <DatePicker
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  setPage(1);
                }}
                placeholder="Start date"
                className="w-[170px] h-9 text-xs"
                clearable
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <DatePicker
                value={endDate}
                onChange={(v) => {
                  setEndDate(v);
                  setPage(1);
                }}
                placeholder="End date"
                className="w-[170px] h-9 text-xs"
                clearable
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <>
          {/* Mobile Skeleton */}
          <div className="lg:hidden space-y-5">
            {[0, 1].map((g) => (
              <div key={g}>
                <Skeleton className={cn('h-3 w-20 rounded-md mb-2.5 ml-1', g === 1 && 'w-24')} />
                <div className="space-y-1.5">
                  {Array.from({ length: g === 0 ? 2 : 3 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl p-3.5 flex items-center gap-3.5">
                      <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-20 rounded-md" />
                        <Skeleton className="h-2.5 w-32 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-16 rounded-md shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Skeleton */}
          <div className="hidden lg:block">
            <div className="rounded-xl border bg-card overflow-hidden p-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="h-12 pl-4"><Skeleton className="h-2.5 w-10 rounded-md" /></th>
                    <th className="h-12"><Skeleton className="h-2.5 w-16 rounded-md" /></th>
                    <th className="h-12"><Skeleton className="h-2.5 w-10 rounded-md" /></th>
                    <th className="h-12 text-right"><Skeleton className="h-2.5 w-14 rounded-md ml-auto" /></th>
                    <th className="h-12 pr-4 text-right w-[100px]"><Skeleton className="h-2.5 w-12 rounded-md ml-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-muted/50 last:border-0">
                      <td className="py-4 pl-4"><Skeleton className="h-3.5 w-24 rounded-md" /></td>
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                          <Skeleton className="h-3.5 w-20 rounded-md" />
                        </div>
                      </td>
                      <td className="py-4"><Skeleton className="h-3 w-36 rounded-md" /></td>
                      <td className="py-4 text-right"><Skeleton className="h-3.5 w-16 rounded-md ml-auto" /></td>
                      <td className="py-4 pr-4">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : loadError ? (
        <div className="py-16 text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive/60" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Could not load expenses</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {loadError}
          </p>
          <Button
            onClick={fetchExpenses}
            variant="outline"
            className="mt-5 rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-16 text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Search className="h-7 w-7 text-primary/50" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No expenses found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {hasFilters
              ? 'Try adjusting your filters to see more results.'
              : "You haven't added any expenses yet. Start tracking your spending!"}
          </p>
          {!hasFilters && (
            <Button
              onClick={() => openForm()}
              className="mt-5 rounded-xl shadow-md shadow-primary/20 px-6 py-2.5 h-auto text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Expense
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Date-Grouped Cards */}
          <div className="lg:hidden space-y-5 animate-fade-in-up">
            {dateGroups.map((group) => (
              <div key={group.date}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((expense) => {
                    const config = CATEGORY_CONFIG[expense.category];
                    const Icon = config?.icon;
                    return (
                      <button
                        key={expense.id}
                        onClick={() => setDetailExpense(expense)}
                        className="w-full text-left bg-card rounded-2xl p-3.5 flex items-center gap-3.5 active:scale-[0.98] transition-all cursor-pointer hover:bg-muted/30"
                      >
                        <div
                          className={cn(
                            'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                            config?.bgColor,
                          )}
                        >
                          {Icon && <Icon className={cn('h-5 w-5', config?.color)} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[14px] truncate">
                            {config?.label}
                          </p>
                          <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                            {expense.note || 'No note'}
                          </p>
                        </div>
                        <p className="font-bold text-[15px] tabular-nums shrink-0">
                          {formatCurrency(expense.amount)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block animate-fade-in-up">
            <div className="rounded-xl border bg-card overflow-hidden p-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-muted">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12 pl-4">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                      Category
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12">
                      Note
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12 text-right">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground h-12 text-right pr-4 w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const config = CATEGORY_CONFIG[expense.category];
                    const Icon = config?.icon;
                    return (
                      <TableRow
                        key={expense.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="whitespace-nowrap text-sm py-4 pl-4">
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                config?.bgColor,
                              )}
                            >
                              {Icon && (
                                <Icon className={cn('h-4.5 w-4.5', config?.color)} />
                              )}
                            </div>
                            <span className="text-sm font-medium">{config?.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] py-4">
                          <div className="group/note relative">
                            <p className="text-sm text-muted-foreground truncate">
                              {expense.note || '—'}
                            </p>
                            {expense.note && expense.note.length > 30 && (
                              <div className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover/note:block">
                                <div className="bg-popover text-popover-foreground text-xs leading-relaxed rounded-lg border shadow-lg px-3 py-2 max-w-[320px] whitespace-normal animate-fade-in-up">
                                  {expense.note}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm tabular-nums py-4">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right py-4 pr-4">
                          <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openForm(expense)}
                              aria-label={`Edit expense ${expense.note || expense.category}`}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(expense)}
                              aria-label={`Delete expense ${expense.note || expense.category}`}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {deleteTarget &&
            (() => {
              const config = CATEGORY_CONFIG[deleteTarget.category];
              const Icon = config?.icon;
              return (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 my-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      config?.bgColor,
                    )}
                  >
                    {Icon && <Icon className={cn('h-5 w-5', config?.color)} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{config?.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(deleteTarget.date)}
                    </p>
                  </div>
                  <p className="font-bold text-sm tabular-nums">
                    {formatCurrency(deleteTarget.amount)}
                  </p>
                </div>
              );
            })()}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-xl"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Detail Bottom Sheet (Mobile) */}
      <Drawer open={!!detailExpense} onOpenChange={(v) => !v && setDetailExpense(null)}>
        <DrawerContent className="min-h-[70vh]">
          <DrawerTitle className="sr-only">Expense Details</DrawerTitle>
          <DrawerDescription className="sr-only">View expense details</DrawerDescription>
          {detailExpense &&
            (() => {
              const config = CATEGORY_CONFIG[detailExpense.category];
              const Icon = config?.icon;
              return (
                <div className="flex flex-col flex-1 px-5 pb-8 pt-1">
                  {/* Header: icon + category + amount */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                        config?.bgColor,
                      )}
                    >
                      {Icon && <Icon className={cn('h-7 w-7', config?.color)} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg">{config?.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span className="text-[13px]">{formatDate(detailExpense.date)}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold tabular-nums shrink-0">
                      {formatCurrency(detailExpense.amount)}
                    </p>
                  </div>

                  {/* Note */}
                  {detailExpense.note && (
                    <div className="bg-muted/40 rounded-xl px-4 py-3 mb-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Note</p>
                      <p className="text-[14px] leading-relaxed">{detailExpense.note}</p>
                    </div>
                  )}

                  {/* Spacer pushes actions to bottom */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl text-sm font-semibold"
                      onClick={() => {
                        const exp = detailExpense;
                        setDetailExpense(null);
                        openForm(exp);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-12 rounded-xl text-sm font-semibold"
                      onClick={() => {
                        const exp = detailExpense;
                        setDetailExpense(null);
                        setDeleteTarget(exp);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })()}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
