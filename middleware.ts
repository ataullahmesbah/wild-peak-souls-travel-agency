import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  isAtLeast,
  prismaRoleToAppRole,
  type UserRole,
  ROLE_HIERARCHY,
} from '@/lib/roles';
import { securityHeaders } from '@/lib/security/headers';

export { ROLE_HIERARCHY };

// ─── Route protection map ─────────────────────────────────────────

interface ProtectedRoute {
  pattern: string;
  minRole: UserRole;
}

const protectedRoutes: ProtectedRoute[] = [
  { pattern: '/dashboard/super-admin', minRole: 'super_admin' },
  { pattern: '/dashboard/admin', minRole: 'admin' },
  { pattern: '/dashboard/moderator', minRole: 'moderator' },
  { pattern: '/dashboard/guide', minRole: 'guide' },
  { pattern: '/dashboard', minRole: 'customer' },
  { pattern: '/bookings', minRole: 'customer' },
  { pattern: '/messages', minRole: 'customer' },
  { pattern: '/profile', minRole: 'customer' },
];

// Super Admin only API patterns
const superAdminOnlyApiPatterns = [
  '/api/admin/api-credentials',
  '/api/admin/system-config',
  '/api/admin/security',
  '/api/admin/integrations',
];

// Auth routes — redirect to dashboard if already logged in
const authOnlyPaths = ['/login', '/register', '/forgot-password'];

function getProtectedRoute(pathname: string): ProtectedRoute | null {
  for (const route of protectedRoutes) {
    if (pathname === route.pattern || pathname.startsWith(route.pattern + '/')) {
      return route;
    }
  }
  return null;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Get JWT token (Edge-compatible) ───────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? 'dev-fallback-secret',
  });

  const userRole: UserRole = token?.role
    ? prismaRoleToAppRole(
        typeof token.role === 'string'
          ? token.role.toUpperCase()
          : String(token.role),
      )
    : 'guest';

  // ── Redirect authenticated users away from auth pages ─────────
  if (authOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + '?')) && token) {
    const roleDashboard: Record<UserRole, string> = {
      super_admin: '/dashboard/super-admin',
      admin: '/dashboard/admin',
      moderator: '/dashboard/moderator',
      guide: '/dashboard/guide',
      customer: '/dashboard',
      guest: '/',
    };
    const dest = roleDashboard[userRole] ?? '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Super Admin only API protection ───────────────────────────
  for (const pattern of superAdminOnlyApiPatterns) {
    if (pathname.startsWith(pattern)) {
      if (userRole !== 'super_admin') {
        return applySecurityHeaders(
          NextResponse.json(
            {
              error: 'Forbidden',
              message:
                'This resource is restricted to Super Administrators only.',
            },
            { status: 403 },
          ),
        );
      }
    }
  }

  // ── Protected route access control ────────────────────────────
  const protectedRoute = getProtectedRoute(pathname);
  if (protectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAtLeast(userRole, protectedRoute.minRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bookings/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/api/admin/:path*',
  ],
};
