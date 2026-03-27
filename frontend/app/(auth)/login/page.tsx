'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { ApiError } from '@/lib/api';

const trustedUserAvatars = [
  {
    name: 'Avery',
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="16" fill="#f59e0b"/>
          <circle cx="16" cy="12" r="6" fill="#fde68a"/>
          <path d="M6 29c1.8-5.8 6-8.7 10-8.7S24.2 23.2 26 29" fill="#92400e"/>
        </svg>
      `),
  },
  {
    name: 'Mila',
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="16" fill="#8b5cf6"/>
          <circle cx="16" cy="12" r="6" fill="#ddd6fe"/>
          <path d="M6 29c1.8-5.8 6-8.7 10-8.7S24.2 23.2 26 29" fill="#5b21b6"/>
        </svg>
      `),
  },
  {
    name: 'Noah',
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="16" fill="#10b981"/>
          <circle cx="16" cy="12" r="6" fill="#a7f3d0"/>
          <path d="M6 29c1.8-5.8 6-8.7 10-8.7S24.2 23.2 26 29" fill="#065f46"/>
        </svg>
      `),
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center px-12 pb-12 pt-28 bg-[#1a0e2e]">
        <div className="absolute inset-0 bg-linear-to-br from-[#1a0e2e] via-[#2d1854] to-[#1a0e2e]" />
        <div className="absolute top-1/4 -right-20 w-[350px] h-[350px] bg-violet-500/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-amber-500/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-[1.15] tracking-tight">
            Take control of<br />your finances
          </h1>
          <p className="text-base text-white/50 leading-relaxed max-w-sm">
            Track expenses, visualize spending patterns, and make smarter financial decisions with powerful insights.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {trustedUserAvatars.map((avatar) => (
                <Image
                  key={avatar.name}
                  src={avatar.src}
                  alt={`${avatar.name} avatar`}
                  className="h-8 w-8 rounded-full border-2 border-[#1a0e2e] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
                  width={32}
                  height={32}
                  unoptimized
                />
              ))}
            </div>
            <p className="text-xs text-white/35">Trusted by thousands of users</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 pt-20 sm:pt-24 lg:px-12 lg:pb-12 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
