import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const expenseSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(255).optional().or(z.literal('')),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const CATEGORIES = [
  { value: 'FOOD', label: 'Food' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'BILLS', label: 'Bills & Utilities' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);
