/**
 * Wild Peak Souls — Expanded RBAC System (Phase 2)
 *
 * Extends Phase 1 role architecture with granular permissions
 * matching the full permission hierarchy specification.
 */

export type UserRole =
  | 'guest'
  | 'customer'
  | 'guide'
  | 'moderator'
  | 'admin'
  | 'super_admin';

export type Permission =
  // Public
  | 'view:public'
  | 'view:content'
  // Profile
  | 'profile:read'
  | 'profile:update'
  // Bookings
  | 'booking:create'
  | 'booking:read:own'
  | 'booking:update:own'
  | 'booking:cancel:own'
  | 'booking:read:all'
  | 'booking:update:all'
  | 'booking:cancel:all'
  // Tours
  | 'tour:read'
  | 'tour:create'
  | 'tour:update:own'
  | 'tour:update:all'
  | 'tour:delete'
  | 'tour:manage:assigned'
  // Destinations
  | 'destination:read'
  | 'destination:create'
  | 'destination:update'
  | 'destination:delete'
  // Travelers (guide-specific)
  | 'traveler:read:assigned'
  | 'traveler:manage:assigned'
  | 'tour:status:update'
  // Content / Blog
  | 'content:read'
  | 'content:create'
  | 'content:update:own'
  | 'content:update:all'
  | 'content:delete:own'
  | 'content:delete:all'
  | 'content:publish'
  // Moderation
  | 'moderation:review'
  | 'moderation:approve'
  | 'moderation:reject'
  | 'moderation:reviews'
  | 'moderation:blogs'
  | 'moderation:comments'
  // Media
  | 'media:upload'
  | 'media:delete:own'
  | 'media:delete:all'
  | 'media:manage'
  // Reviews
  | 'review:create'
  | 'review:read'
  | 'review:update:own'
  | 'review:delete:own'
  | 'review:delete:all'
  | 'review:manage'
  // Events
  | 'event:read'
  | 'event:create'
  | 'event:update'
  | 'event:delete'
  | 'event:manage'
  // Messaging
  | 'message:send'
  | 'message:read:own'
  | 'message:read:all'
  // Users
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:suspend'
  | 'user:ban'
  | 'user:manage'
  | 'user:role:assign'
  // Analytics
  | 'analytics:read:own'
  | 'analytics:read:all'
  // Logs
  | 'log:read:own'
  | 'log:read:all'
  // Admin
  | 'admin:dashboard'
  | 'admin:settings'
  | 'admin:reports'
  // Super Admin only
  | 'superadmin:access'
  | 'api:manage'
  | 'api:credentials:read'
  | 'api:credentials:update'
  | 'system:config'
  | 'system:manage'
  | 'system:logs:all'
  | 'security:center'
  | 'permission:manage'
  | 'admin:manage';

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  dashboardPath: string;
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Unauthenticated visitor with public access only',
    level: 0,
    permissions: ['view:public', 'view:content', 'content:read', 'tour:read', 'destination:read', 'review:read', 'event:read'],
    dashboardPath: '/',
  },
  customer: {
    id: 'customer',
    name: 'Customer',
    description: 'Registered user who can book tours and manage own data',
    level: 1,
    permissions: [
      'view:public',
      'view:content',
      'content:read',
      'tour:read',
      'destination:read',
      'event:read',
      'review:read',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read:own',
      'booking:update:own',
      'booking:cancel:own',
      'message:send',
      'message:read:own',
      'review:create',
      'review:update:own',
      'review:delete:own',
      'media:upload',
      'media:delete:own',
      'analytics:read:own',
      'log:read:own',
    ],
    dashboardPath: '/dashboard',
  },
  guide: {
    id: 'guide',
    name: 'Travel Guide',
    description: 'Verified guide managing assigned tours and travelers',
    level: 2,
    permissions: [
      'view:public',
      'view:content',
      'content:read',
      'content:create',
      'content:update:own',
      'content:delete:own',
      'tour:read',
      'tour:manage:assigned',
      'tour:status:update',
      'destination:read',
      'event:read',
      'review:read',
      'review:create',
      'review:update:own',
      'profile:read',
      'profile:update',
      'booking:read:all',
      'booking:update:all',
      'traveler:read:assigned',
      'traveler:manage:assigned',
      'message:send',
      'message:read:own',
      'media:upload',
      'media:delete:own',
      'analytics:read:own',
    ],
    dashboardPath: '/dashboard/guide',
  },
  moderator: {
    id: 'moderator',
    name: 'Moderator',
    description: 'Reviews and moderates user-generated content',
    level: 3,
    permissions: [
      'view:public',
      'view:content',
      'content:read',
      'content:update:all',
      'content:delete:all',
      'content:publish',
      'tour:read',
      'destination:read',
      'event:read',
      'review:read',
      'review:delete:all',
      'review:manage',
      'moderation:review',
      'moderation:approve',
      'moderation:reject',
      'moderation:reviews',
      'moderation:blogs',
      'moderation:comments',
      'user:read',
      'profile:read',
      'profile:update',
      'media:upload',
      'media:delete:own',
      'message:read:own',
      'log:read:own',
    ],
    dashboardPath: '/dashboard/moderator',
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Full platform management excluding system-level config',
    level: 4,
    permissions: [
      'view:public',
      'view:content',
      'content:read',
      'content:create',
      'content:update:all',
      'content:delete:all',
      'content:publish',
      'tour:read',
      'tour:create',
      'tour:update:all',
      'tour:delete',
      'destination:read',
      'destination:create',
      'destination:update',
      'destination:delete',
      'event:read',
      'event:create',
      'event:update',
      'event:delete',
      'event:manage',
      'booking:read:all',
      'booking:update:all',
      'booking:cancel:all',
      'review:read',
      'review:manage',
      'review:delete:all',
      'moderation:review',
      'moderation:approve',
      'moderation:reject',
      'moderation:reviews',
      'moderation:blogs',
      'moderation:comments',
      'user:read',
      'user:create',
      'user:update',
      'user:suspend',
      'user:ban',
      'user:manage',
      'profile:read',
      'profile:update',
      'media:upload',
      'media:manage',
      'media:delete:all',
      'message:read:all',
      'analytics:read:all',
      'log:read:all',
      'admin:dashboard',
      'admin:settings',
      'admin:reports',
    ],
    dashboardPath: '/dashboard/admin',
  },
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Complete platform control including system and API management',
    level: 5,
    permissions: [
      // Inherits all admin permissions plus:
      'view:public',
      'view:content',
      'content:read',
      'content:create',
      'content:update:all',
      'content:delete:all',
      'content:publish',
      'tour:read',
      'tour:create',
      'tour:update:all',
      'tour:delete',
      'destination:read',
      'destination:create',
      'destination:update',
      'destination:delete',
      'event:read',
      'event:create',
      'event:update',
      'event:delete',
      'event:manage',
      'booking:read:all',
      'booking:update:all',
      'booking:cancel:all',
      'review:read',
      'review:manage',
      'review:delete:all',
      'moderation:review',
      'moderation:approve',
      'moderation:reject',
      'moderation:reviews',
      'moderation:blogs',
      'moderation:comments',
      'user:read',
      'user:create',
      'user:update',
      'user:delete',
      'user:suspend',
      'user:ban',
      'user:manage',
      'user:role:assign',
      'profile:read',
      'profile:update',
      'media:upload',
      'media:manage',
      'media:delete:all',
      'message:read:all',
      'analytics:read:all',
      'log:read:all',
      'admin:dashboard',
      'admin:settings',
      'admin:reports',
      'admin:manage',
      // Super Admin exclusive
      'superadmin:access',
      'api:manage',
      'api:credentials:read',
      'api:credentials:update',
      'system:config',
      'system:manage',
      'system:logs:all',
      'security:center',
      'permission:manage',
    ],
    dashboardPath: '/dashboard/super-admin',
  },
};

export const ROLE_HIERARCHY: UserRole[] = [
  'guest',
  'customer',
  'guide',
  'moderator',
  'admin',
  'super_admin',
];

// ─── Utility functions ────────────────────────────────────────────

export function getRole(role: UserRole): RoleDefinition {
  return ROLES[role];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function isAtLeast(role: UserRole, minimum: UserRole): boolean {
  return (ROLES[role]?.level ?? 0) >= (ROLES[minimum]?.level ?? 0);
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canAccessApiManagement(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const protectedRoutes: Record<string, UserRole[]> = {
    '/dashboard/super-admin': ['super_admin'],
    '/dashboard/admin': ['admin', 'super_admin'],
    '/dashboard/moderator': ['moderator', 'admin', 'super_admin'],
    '/dashboard/guide': ['guide', 'admin', 'super_admin'],
    '/dashboard': ['customer', 'guide', 'moderator', 'admin', 'super_admin'],
    '/bookings': ['customer', 'guide', 'admin', 'super_admin'],
    '/messages': ['customer', 'guide', 'admin', 'super_admin'],
    '/profile': ['customer', 'guide', 'moderator', 'admin', 'super_admin'],
    '/api/admin': ['admin', 'super_admin'],
    '/api/super-admin': ['super_admin'],
  };

  for (const [prefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (route === prefix || route.startsWith(prefix + '/')) {
      return allowedRoles.includes(role);
    }
  }
  return true;
}

// Maps from the Prisma UserRole enum (uppercase) to the app role type
export function prismaRoleToAppRole(prismaRole: string): UserRole {
  const map: Record<string, UserRole> = {
    GUEST: 'guest',
    CUSTOMER: 'customer',
    GUIDE: 'guide',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  };
  return map[prismaRole] ?? 'guest';
}
