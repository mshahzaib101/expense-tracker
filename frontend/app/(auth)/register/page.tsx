'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully!');
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
        <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] bg-violet-500/15 rounded-full blur-[120px]" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-emerald-500/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-[1.15] tracking-tight">
            Start your journey<br />to financial clarity
          </h1>
          <p className="text-base text-white/50 leading-relaxed max-w-sm">
            Join thousands of users who have gained control over their spending habits with our intuitive tracking tools.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              { label: 'Track', desc: 'Every expense' },
              { label: 'Analyze', desc: 'Your patterns' },
              { label: 'Save', desc: 'More money' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-white/90">{item.label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 pt-20 sm:pt-24 lg:px-12 lg:pb-12 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Get started tracking your expenses in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Min. 8 characters"
                className="h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                className="h-11 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating account...'
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
