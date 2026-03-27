import { z } from 'zod';

const categoryEnum = z.enum([
  'FOOD',
  'TRANSPORT',
  'ENTERTAINMENT',
  'SHOPPING',
  'BILLS',
  'HEALTH',
  'EDUCATION',
  'OTHER',
]);

export const createExpenseSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  category: categoryEnum,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z
    .string()
    .max(255, 'Note must be 255 characters or less')
    .optional()
    .nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const queryExpensesSchema = z.object({
  category: categoryEnum.optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'category', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const summaryQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
    .optional(),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type QueryExpensesDto = z.infer<typeof queryExpensesSchema>;
export type SummaryQueryDto = z.infer<typeof summaryQuerySchema>;
