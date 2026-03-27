'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ExpenseFormDialog } from '@/components/expense-form-dialog';
import type { Expense } from '@/lib/api';

type ExpenseFormContextType = {
  openForm: (expense?: Expense | null) => void;
  closeForm: () => void;
  onExpenseChange: (callback: () => void) => () => void;
};

const ExpenseFormContext = createContext<ExpenseFormContextType | null>(null);

export function useExpenseForm() {
  const ctx = useContext(ExpenseFormContext);
  if (!ctx) throw new Error('useExpenseForm must be used within ExpenseFormProvider');
  return ctx;
}

export function ExpenseFormProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const listenersRef = useRef<Set<() => void>>(new Set());

  const openForm = useCallback((expense?: Expense | null) => {
    setEditingExpense(expense ?? null);
    setOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setOpen(false);
    setEditingExpense(null);
  }, []);

  const onExpenseChange = useCallback((callback: () => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const handleSuccess = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  return (
    <ExpenseFormContext.Provider value={{ openForm, closeForm, onExpenseChange }}>
      {children}
      <ExpenseFormDialog
        open={open}
        onClose={closeForm}
        onSuccess={handleSuccess}
        expense={editingExpense}
      />
    </ExpenseFormContext.Provider>
  );
}
