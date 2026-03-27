import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-violet-400 shadow-lg shadow-violet-500/20">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-sm font-bold tracking-tight text-foreground sm:block lg:text-white">
              Expense Tracker
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
