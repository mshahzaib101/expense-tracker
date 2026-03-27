'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { api, type User } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { clearProtectedDataCache } from '@/lib/client-cache';
import { setUnauthorizedHandler } from '@/lib/auth-events';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const protectedRoutes = ['/overview', '/expenses', '/settings'];
const authRoutes = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const unauthorizedHandledRef = useRef(false);
  const shouldProtectPath = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isHomeRoute = pathname === '/';

  const clearSession = useCallback(() => {
    clearProtectedDataCache();
    setUser(null);
  }, []);

  const redirectToLoginIfNeeded = useCallback(() => {
    if (shouldProtectPath) {
      router.replace('/login');
    }
  }, [router, shouldProtectPath]);

  useEffect(() => {
    unauthorizedHandledRef.current = false;
  }, [pathname]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (unauthorizedHandledRef.current) {
        return;
      }
      unauthorizedHandledRef.current = true;
      clearSession();
      redirectToLoginIfNeeded();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession, redirectToLoginIfNeeded]);

  useEffect(() => {
    api.auth
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        clearSession();
        redirectToLoginIfNeeded();
      })
      .finally(() => setLoading(false));
  }, [clearSession, redirectToLoginIfNeeded]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      if (shouldProtectPath) {
        router.replace('/login');
      }
      return;
    }

    if (isHomeRoute || isAuthRoute) {
      router.replace('/overview');
    }
  }, [isAuthRoute, isHomeRoute, loading, router, shouldProtectPath, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      clearProtectedDataCache();
      const data = await api.auth.login({ email, password });
      setUser(data.user);
      router.push('/overview');
    },
    [router],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      clearProtectedDataCache();
      const data = await api.auth.register({ name, email, password });
      setUser(data.user);
      router.push('/overview');
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      toast.error('Failed to log out. Please try again.');
      return;
    }
    clearSession();
    router.push('/login');
  }, [clearSession, router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const clearUser = useCallback(() => {
    clearSession();
    router.push('/login');
  }, [clearSession, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
