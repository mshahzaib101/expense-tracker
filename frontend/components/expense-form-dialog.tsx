'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { expenseSchema, type ExpenseInput } from '@/lib/validators';
import { CATEGORY_LIST } from '@/lib/constants';
import { api, ApiError, type Expense } from '@/lib/api';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/date-picker';
import { getLocalRelativeDate, getLocalToday } from '@/lib/date';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null;
};

function isDatePickerPortalTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('[data-date-picker-portal="true"]');
}

function useIsMobile(breakpoint = 1024) {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    () => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
    () => false,
  );
}

export function ExpenseFormDialog({ open, onClose, onSuccess, expense }: Props) {
  const isEditing = !!expense;
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: undefined, category: '', date: '', note: '' },
  });

  const selectedCategory = watch('category');
  const selectedDate = watch('date');

  useEffect(() => {
    if (open && expense) {
      reset({
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        note: expense.note ?? '',
      });
    } else if (open) {
      reset({
        amount: undefined as unknown as number,
        category: '',
        date: getLocalToday(),
        note: '',
      });
    }
  }, [open, expense, reset]);

  async function onSubmit(data: ExpenseInput) {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: data.amount,
        category: data.category,
        date: data.date,
        note: data.note || null,
      };

      if (isEditing && expense) {
        await api.expenses.update(expense.id, payload);
        toast.success('Expense updated');
      } else {
        await api.expenses.create(payload);
        toast.success('Expense added');
      }
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount - hero input */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Amount
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-2xl font-bold">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-10 h-16 text-3xl font-extrabold tabular-nums bg-muted/40 border-transparent rounded-2xl focus:border-primary/30 focus:bg-background tracking-tight"
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Category grid */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_LIST.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all text-center',
                  isActive
                    ? 'bg-primary/10 ring-2 ring-primary/40 scale-[1.02]'
                    : 'bg-muted/40 hover:bg-muted/70',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-transform',
                    cat.bgColor,
                    isActive && 'scale-110',
                  )}
                >
                  <Icon className={cn('h-5 w-5', cat.color)} />
                </div>
                <span className={cn(
                  'text-[11px] font-semibold leading-tight',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Date with quick chips */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Date
        </Label>
        <div className="flex gap-2 mb-2">
          {[
            { label: 'Today', value: getLocalToday() },
            { label: 'Yesterday', value: getLocalRelativeDate(-1) },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setValue('date', preset.value, { shouldValidate: true })}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedDate === preset.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <DatePicker
          value={selectedDate}
          onChange={(date) => setValue('date', date, { shouldValidate: true })}
          placeholder="Pick a date"
        />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date.message}</p>
        )}
      </div>

      {/* Note textarea */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Note <span className="normal-case font-normal tracking-normal text-muted-foreground/60">(optional)</span>
        </Label>
        <textarea
          placeholder="Lunch, groceries, subscription..."
          rows={2}
          className={cn(
            'flex w-full rounded-xl bg-muted/40 border border-transparent px-4 py-3 text-sm',
            'placeholder:text-muted-foreground/50 resize-none',
            'focus:outline-none focus:border-primary/30 focus:bg-background transition-colors',
          )}
          {...register('note')}
        />
        {errors.note && (
          <p className="text-xs text-destructive">{errors.note.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 rounded-xl font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold"
        >
          {isSubmitting
            ? isEditing ? 'Saving...' : 'Adding...'
            : isEditing ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent
          className="min-h-[85vh]"
          onPointerDownOutside={(event) => {
            if (isDatePickerPortalTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (isDatePickerPortalTarget(event.target)) {
              event.preventDefault();
            }
          }}
        >
          <DrawerTitle className="sr-only">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </DrawerTitle>
          <div className="px-5 pb-8 pt-1 overflow-y-auto">
            <p className="text-lg font-bold mb-5">
              {isEditing ? 'Edit Expense' : 'Add Expense'}
            </p>
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 pt-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
