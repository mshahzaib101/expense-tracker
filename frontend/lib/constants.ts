import {
  Coffee,
  CarFront,
  Gamepad2,
  Tag,
  Flame,
  HeartPulse,
  BookOpen,
  Layers,
  type LucideIcon,
} from 'lucide-react';

export type CategoryConfig = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  ringColor: string;
  chartColor: string;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  FOOD: {
    value: 'FOOD',
    label: 'Food',
    icon: Coffee,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100/80',
    ringColor: 'ring-orange-200',
    chartColor: '#f97316',
  },
  TRANSPORT: {
    value: 'TRANSPORT',
    label: 'Transport',
    icon: CarFront,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100/80',
    ringColor: 'ring-cyan-200',
    chartColor: '#06b6d4',
  },
  ENTERTAINMENT: {
    value: 'ENTERTAINMENT',
    label: 'Entertainment',
    icon: Gamepad2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100/80',
    ringColor: 'ring-purple-200',
    chartColor: '#9333ea',
  },
  SHOPPING: {
    value: 'SHOPPING',
    label: 'Shopping',
    icon: Tag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100/80',
    ringColor: 'ring-pink-200',
    chartColor: '#ec4899',
  },
  BILLS: {
    value: 'BILLS',
    label: 'Bills & Utilities',
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-100/80',
    ringColor: 'ring-red-200',
    chartColor: '#ef4444',
  },
  HEALTH: {
    value: 'HEALTH',
    label: 'Health',
    icon: HeartPulse,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100/80',
    ringColor: 'ring-emerald-200',
    chartColor: '#10b981',
  },
  EDUCATION: {
    value: 'EDUCATION',
    label: 'Education',
    icon: BookOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100/80',
    ringColor: 'ring-amber-200',
    chartColor: '#d97706',
  },
  OTHER: {
    value: 'OTHER',
    label: 'Other',
    icon: Layers,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100/80',
    ringColor: 'ring-slate-200',
    chartColor: '#64748b',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORY_CONFIG);

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
