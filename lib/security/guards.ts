/**
 * Permission Guards — Server-side permission checking utilities.
 *
 * Use in API routes and Server Components to enforce role-based access.
 * These functions never expose sensitive data to the client.
 */

import { getSession } from '@/lib/auth/config';
import {
  hasPermission,
  hasAnyPermission,
  isAtLeast,
  type Permission,
  type UserRole,
} from '@/lib/roles';
import { NextResponse } from 'next/server';

export interface AuthGuardResult {
  authorized: boolean;
  session?: Awaited<ReturnType<typeof getSession>>;
  role?: UserRole;
  userId?: string;
}

export async function requireAuth(): Promise<AuthGuardResult> {
  const session = await getSession();
  if (!session?.user) return { authorized: false };
  return {
    authorized: true,
    session,
    role: session.user.role,
    userId: session.user.id,
  };
}

export async function requireRole(minRole: UserRole): Promise<AuthGuardResult> {
  const result = await requireAuth();
  if (!result.authorized || !result.role) return { authorized: false };
  if (!isAtLeast(result.role, minRole)) return { authorized: false };
  return result;
}

export async function requirePermission(permission: Permission): Promise<AuthGuardResult> {
  const result = await requireAuth();
  if (!result.authorized || !result.role) return { authorized: false };
  if (!hasPermission(result.role, permission)) return { authorized: false };
  return result;
}

export async function requireAnyPermission(permissions: Permission[]): Promise<AuthGuardResult> {
  const result = await requireAuth();
  if (!result.authorized || !result.role) return { authorized: false };
  if (!hasAnyPermission(result.role, permissions)) return { authorized: false };
  return result;
}

export async function requireSuperAdmin(): Promise<AuthGuardResult> {
  const result = await requireAuth();
  if (!result.authorized || result.role !== 'super_admin') return { authorized: false };
  return result;
}

// API route helpers — return NextResponse on failure, null on success
export async function guardApiRoute(minRole: UserRole) {
  const result = await requireRole(minRole);
  if (!result.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You do not have access to this resource.' },
      { status: 401 },
    );
  }
  return null;
}

export async function guardApiPermission(permission: Permission) {
  const result = await requirePermission(permission);
  if (!result.authorized) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient permissions for this action.' },
      { status: 403 },
    );
  }
  return null;
}

// Super Admin only — used to protect API credential endpoints
export async function guardSuperAdminOnly() {
  const result = await requireSuperAdmin();
  if (!result.authorized) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message:
          'This endpoint is restricted to Super Administrators only. API credentials and system configuration cannot be accessed by your current role.',
      },
      { status: 403 },
    );
  }
  return null;
}
