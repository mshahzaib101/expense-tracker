import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(128, 'Current password must be 128 characters or less'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be 128 characters or less'),
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password')
      .max(128, 'Confirmation password must be 128 characters or less'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be 128 characters or less'),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;
