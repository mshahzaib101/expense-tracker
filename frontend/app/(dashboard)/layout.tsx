'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Receipt, House, LogOut, Wallet, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { ExpenseFormProvider, useExpenseForm } from '@/components/expense-form-provider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/overview', label: 'Home', icon: House },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { openForm } = useExpenseForm();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-2xl bg-primary/10" />
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[260px] lg:flex-col bg-sidebar">
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sidebar-primary to-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Wallet className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-[15px] font-bold text-sidebar-foreground tracking-tight">
            Expense Tracker
          </span>
        </div>

        <div className="px-3 pt-5 pb-2">
          <button
            onClick={() => openForm()}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-sidebar-primary text-white text-[13px] font-semibold shadow-lg shadow-sidebar-primary/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Expense
          </button>
        </div>

        <nav className="flex-1 px-3 pt-2 pb-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                    : 'text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                )}
              >
                <link.icon className="h-[18px] w-[18px]" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-sidebar-foreground/40 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg text-xs h-8"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </aside>

      {/* ─── Main area ─── */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-violet-400 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">Expense Tracker</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold transition-all active:scale-95"
              >
                {user?.name.charAt(0).toUpperCase()}
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-10 z-50 w-52 bg-card rounded-xl border shadow-xl animate-scale-in p-2">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>
                    <button
                      onClick={() => { setShowUserMenu(false); logout(); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-4 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* ─── Mobile Bottom Navigation ─── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <div className="bg-card/95 backdrop-blur-2xl border-t shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-around h-[68px] px-6 relative">
              {/* Home Tab */}
              <Link
                href="/overview"
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all duration-300',
                  pathname === '/overview'
                    ? 'text-primary'
                    : 'text-muted-foreground/60 active:scale-95',
                )}
              >
                <div className={cn(
                  'relative p-2 rounded-xl transition-all duration-300',
                  pathname === '/overview' && 'bg-primary/10',
                )}>
                  <House className={cn('h-[22px] w-[22px] transition-all duration-300', pathname === '/overview' && 'scale-110')} />
                </div>
                <span className={cn(
                  'text-[10px] font-bold transition-all duration-300',
                  pathname === '/overview' ? 'text-primary' : 'text-muted-foreground/50',
                )}>Home</span>
              </Link>

              {/* Center FAB */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
                  <button
                    onClick={() => openForm()}
                    className="relative w-14 h-14 rounded-full bg-linear-to-br from-primary to-violet-500 text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-all duration-200 hover:shadow-primary/50 ring-4 ring-background"
                  >
                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Expenses Tab */}
              <Link
                href="/expenses"
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all duration-300',
                  pathname === '/expenses'
                    ? 'text-primary'
                    : 'text-muted-foreground/60 active:scale-95',
                )}
              >
                <div className={cn(
                  'relative p-2 rounded-xl transition-all duration-300',
                  pathname === '/expenses' && 'bg-primary/10',
                )}>
                  <Receipt className={cn('h-[22px] w-[22px] transition-all duration-300', pathname === '/expenses' && 'scale-110')} />
                </div>
                <span className={cn(
                  'text-[10px] font-bold transition-all duration-300',
                  pathname === '/expenses' ? 'text-primary' : 'text-muted-foreground/50',
                )}>Expenses</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExpenseFormProvider>
      <DashboardShell>{children}</DashboardShell>
    </ExpenseFormProvider>
  );
}
