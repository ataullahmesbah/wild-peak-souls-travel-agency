import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateSecureToken } from '@/lib/security/tokens';
import { auditLogger } from '@/lib/security/audit-logger';
import type { ServiceResult } from '@/lib/services/types';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ipAddress?: string;
}

export interface RegisterResult {
  userId: string;
  email: string;
  verificationToken: string;
}

export async function registerUser(
  input: RegisterInput,
): Promise<ServiceResult<RegisterResult>> {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const verificationToken = generateSecureToken();

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
      name: `${input.firstName} ${input.lastName}`.trim(),
      role: 'CUSTOMER',
      status: 'PENDING_VERIFICATION',
      provider: 'CREDENTIALS',
      profile: {
        create: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
      },
      verificationTokens: {
        create: {
          token: verificationToken,
          identifier: email,
          type: 'email_verification',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      },
    },
  });

  await auditLogger.log({
    action: 'REGISTER',
    entityType: 'User',
    entityId: user.id,
    userId: user.id,
    ipAddress: input.ipAddress,
    success: true,
    metadata: { email, provider: 'CREDENTIALS' },
  });

  return {
    success: true,
    data: { userId: user.id, email: user.email, verificationToken },
  };
}

export async function verifyEmail(token: string): Promise<ServiceResult<{ userId: string }>> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return { success: false, error: 'Invalid verification token.' };
  if (record.used) return { success: false, error: 'This token has already been used.' };
  if (record.expires < new Date()) return { success: false, error: 'Verification token has expired.' };

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true, usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
    }),
  ]);

  await auditLogger.log({
    action: 'EMAIL_VERIFICATION',
    entityType: 'User',
    entityId: record.userId,
    userId: record.userId,
    success: true,
  });

  return { success: true, data: { userId: record.userId } };
}

export async function requestPasswordReset(
  email: string,
  ipAddress?: string,
): Promise<ServiceResult<{ token: string }>> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true, data: { token: '' } };
  }

  // Invalidate any existing reset tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true, usedAt: new Date() },
  });

  const token = generateSecureToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      ipAddress,
    },
  });

  await auditLogger.log({
    action: 'PASSWORD_RESET',
    entityType: 'User',
    entityId: user.id,
    userId: user.id,
    ipAddress,
    success: true,
    metadata: { step: 'requested' },
  });

  return { success: true, data: { token } };
}

export async function resetPassword(
  token: string,
  newPassword: string,
  ipAddress?: string,
): Promise<ServiceResult<void>> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) return { success: false, error: 'Invalid or expired reset token.' };
  if (record.used) return { success: false, error: 'This reset link has already been used.' };
  if (record.expires < new Date()) return { success: false, error: 'Reset token has expired.' };

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true, usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        hashedPassword,
        failedLoginCount: 0,
        lockedUntil: null,
        status: 'ACTIVE',
      },
    }),
  ]);

  await auditLogger.log({
    action: 'PASSWORD_CHANGE',
    entityType: 'User',
    entityId: record.userId,
    userId: record.userId,
    ipAddress,
    success: true,
    metadata: { step: 'reset_completed' },
  });

  return { success: true };
}
