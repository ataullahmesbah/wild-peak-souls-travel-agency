import { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/lib/roles';
import { prismaRoleToAppRole } from '@/lib/roles';

/**
 * Auth config — database-optional for dev safety.
 *
 * The Prisma adapter and database queries are wrapped in try/catch so
 * the app renders correctly even when DATABASE_URL isn't connected yet.
 * When a real database is connected, full functionality activates.
 */

function buildProviders() {
  const providers: NextAuthOptions['providers'] = [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ipAddress =
          (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] ??
          (req?.headers?.['x-real-ip'] as string) ??
          'unknown';

        try {
          const { prisma } = await import('@/lib/db');
          const { auditLogger } = await import('@/lib/security/audit-logger');

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: { profile: true },
          });

          if (!user || !user.hashedPassword) {
            await auditLogger.log({
              action: 'LOGIN',
              entityType: 'User',
              ipAddress,
              success: false,
              errorMessage: 'User not found or no password set',
              metadata: { email: credentials.email },
            });
            return null;
          }

          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('ACCOUNT_LOCKED');
          }

          if (user.status === 'BANNED') throw new Error('ACCOUNT_BANNED');
          if (user.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');

          const isValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword,
          );

          if (!isValid) {
            const failedCount = user.failedLoginCount + 1;
            const shouldLock = failedCount >= 5;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: failedCount,
                lastFailedLoginAt: new Date(),
                lockedUntil: shouldLock
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : undefined,
              },
            });

            if (shouldLock) throw new Error('ACCOUNT_LOCKED');
            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lastFailedLoginAt: null,
              lockedUntil: null,
              lastLoginAt: new Date(),
              lastLoginIp: ipAddress,
              status:
                user.status === 'PENDING_VERIFICATION'
                  ? 'PENDING_VERIFICATION'
                  : 'ACTIVE',
            },
          });

          await auditLogger.log({
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            userId: user.id,
            ipAddress,
            success: true,
          });

          return {
            id: user.id,
            email: user.email,
            name:
              user.name ||
              `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim() ||
              user.email,
            image: user.image ?? user.profile?.avatarUrl ?? null,
            role: prismaRoleToAppRole(user.role),
            emailVerified: user.emailVerified,
          };
        } catch (err: unknown) {
          // Re-throw auth errors (ACCOUNT_LOCKED etc.) — swallow DB errors
          if (err instanceof Error && err.message.startsWith('ACCOUNT_')) {
            throw err;
          }
          console.error('[Auth] Credentials authorize error:', err);
          return null;
        }
      },
    }),
  ];

  // Only add Google provider when credentials are configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  // Adapter is intentionally omitted here — added conditionally at runtime
  // when DATABASE_URL is available. JWT strategy does not require an adapter.

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 days
    updateAge: 24 * 60 * 60,    // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/dashboard',
  },

  providers: buildProviders(),

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const { prisma } = await import('@/lib/db');

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email ?? '' },
          });

          if (existingUser?.status === 'BANNED') return false;
          if (existingUser?.status === 'SUSPENDED') {
            return '/login?error=ACCOUNT_SUSPENDED';
          }

          if (!existingUser && user.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                emailVerified: new Date(),
                status: 'ACTIVE',
                provider: 'GOOGLE',
              },
            });

            await prisma.profile.create({
              data: {
                userId: user.id,
                firstName: (profile as { given_name?: string })?.given_name,
                lastName: (profile as { family_name?: string })?.family_name,
                avatarUrl: user.image ?? undefined,
              },
            });
          }
        } catch (err) {
          console.error('[Auth] Google signIn callback error:', err);
          // Allow sign-in even if DB update fails
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? 'customer';
        token.emailVerified =
          (user as { emailVerified?: Date | null }).emailVerified ?? null;
      }

      if (trigger === 'update' && session) {
        token.name = session.name ?? token.name;
        token.picture = session.image ?? token.picture;
        token.role = (session.role as UserRole) ?? token.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? '';
        session.user.role = (token.role as UserRole) ?? 'customer';
        session.user.emailVerified =
          (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token?.id) {
        try {
          const { auditLogger } = await import('@/lib/security/audit-logger');
          await auditLogger.log({
            action: 'LOGOUT',
            entityType: 'User',
            entityId: token.id as string,
            userId: token.id as string,
            success: true,
          });
        } catch {
          // Non-critical — never block signout
        }
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-fallback-secret-change-in-production',
};

export const getSession = () => getServerSession(authOptions);
