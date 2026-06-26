'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import {
  hasPermission,
  hasAnyPermission,
  isAtLeast,
  type UserRole,
  type Permission,
} from '@/lib/roles';

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user ?? null;
  const role: UserRole = user?.role ?? 'guest';
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isEmailVerified = !!user?.emailVerified;

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isEmailVerified,
    session,
    update,

    // Permission checks
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    atLeast: (minRole: UserRole) => isAtLeast(role, minRole),
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
    isGuide: role === 'guide',
    isModerator: role === 'moderator',
    isCustomer: role === 'customer',

    // Auth actions
    login: (email: string, password: string, callbackUrl?: string) =>
      signIn('credentials', { email, password, callbackUrl }),
    loginWithGoogle: (callbackUrl?: string) =>
      signIn('google', { callbackUrl }),
    logout: (callbackUrl = '/') => signOut({ callbackUrl }),
  };
}
