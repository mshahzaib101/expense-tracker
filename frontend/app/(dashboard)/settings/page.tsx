'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Lock, Download, Trash2, Loader2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DatePicker } from '@/components/date-picker';
import { useAuth } from '@/components/auth-provider';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatLocalRangeDate, getLocalToday } from '@/lib/date';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type DeleteAccountInput,
} from '@/lib/validators';

const inputClassName = 'h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all';
const labelClassName = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

export default function SettingsPage() {
  const { user, updateUser, clearUser } = useAuth();

  return (
    <div className="space-y-5 lg:space-y-6 max-w-2xl">
      <div className="animate-fade-in-up">
        <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <ProfileSection user={user} onUpdate={updateUser} />
      <PasswordSection onSuccess={clearUser} />
      <ExportSection />
      <DeleteAccountSection onDeleted={clearUser} />
    </div>
  );
}

function ProfileSection({
  user,
  onUpdate,
}: {
  user: { id: string; name: string; email: string; createdAt: string } | null;
  onUpdate: (user: { id: string; name: string; email: string; createdAt: string }) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: user?.name ?? '' },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setIsSubmitting(true);
    try {
      const result = await api.users.updateProfile({ name: data.name });
      onUpdate(result.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="animate-fade-in-up stagger-1 border-none shadow-sm">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Profile</h2>
            <p className="text-xs text-muted-foreground">Update your display name</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={labelClassName}>
              Name
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              className={inputClassName}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Email</Label>
            <Input
              value={user?.email ?? ''}
              disabled
              className="h-11 bg-muted/30 border-transparent opacity-60 cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="rounded-xl text-sm font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordInput) {
    setIsSubmitting(true);
    try {
      await api.users.changePassword(data);
      toast.success('Password changed. Please log in again.');
      reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="animate-fade-in-up stagger-2 border-none shadow-sm">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Password</h2>
            <p className="text-xs text-muted-foreground">
              You will be signed out after changing your password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className={labelClassName}>
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              className={inputClassName}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="newPassword" className={labelClassName}>
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimum 8 characters"
              className={inputClassName}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword" className={labelClassName}>
              Confirm New Password
            </Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="Repeat new password"
              className={inputClassName}
              {...register('confirmNewPassword')}
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-sm font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Changing...
                </span>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type ExportPreset = 'all' | 'month' | '3m' | '6m' | 'year' | 'custom';

const EXPORT_PRESETS: { key: ExportPreset; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: '3m', label: 'Last 3 Months' },
  { key: '6m', label: 'Last 6 Months' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' },
];

function getExportDateRange(preset: ExportPreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = getLocalToday();

  switch (preset) {
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case '3m': {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case '6m': {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 6);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: formatLocalRangeDate(start), endDate: today };
    }
    case 'all':
    case 'custom':
      return {};
  }
}

function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [preset, setPreset] = useState<ExportPreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  async function handleExport() {
    let params: { startDate?: string; endDate?: string };

    if (preset === 'custom') {
      params = {};
      if (customStart) params.startDate = customStart;
      if (customEnd) params.endDate = customEnd;
    } else {
      params = getExportDateRange(preset);
    }

    setIsExporting(true);
    try {
      const blob = await api.expenses.export(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${getLocalToday()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Expenses exported successfully');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to export expenses');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card className="animate-fade-in-up stagger-3 border-none shadow-sm">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Download className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Export Data</h2>
            <p className="text-xs text-muted-foreground">
              Download your expenses as a CSV file
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={labelClassName}>Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {EXPORT_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreset(p.key)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                    preset === p.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={labelClassName}>
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Start Date
                </Label>
                <DatePicker
                  value={customStart}
                  onChange={setCustomStart}
                  placeholder="From..."
                  clearable
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClassName}>
                  <Calendar className="inline h-3 w-3 mr-1" />
                  End Date
                </Label>
                <DatePicker
                  value={customEnd}
                  onChange={setCustomEnd}
                  placeholder="To..."
                  clearable
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-xl text-sm font-semibold"
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Export CSV
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
  });

  async function onSubmit(data: DeleteAccountInput) {
    setIsSubmitting(true);
    try {
      await api.users.deleteAccount(data);
      toast.success('Account deleted. We\'re sorry to see you go.');
      setOpen(false);
      reset();
      onDeleted();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="animate-fade-in-up stagger-4 border-none shadow-sm border-destructive/20">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-destructive">Delete Account</h2>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all expenses
              </p>
            </div>
          </div>

          <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  className="rounded-xl text-sm font-semibold text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive shrink-0"
                />
              }
            >
              Delete Account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all of your expense data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-4 space-y-2">
                  <Label htmlFor="delete-password" className={labelClassName}>
                    Enter your password to confirm
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Your password"
                    className={inputClassName}
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                      </span>
                    ) : (
                      'Yes, delete my account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
