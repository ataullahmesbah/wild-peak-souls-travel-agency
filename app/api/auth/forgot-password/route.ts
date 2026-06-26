import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requestPasswordReset } from '@/lib/auth/auth-service';
import { sendPasswordResetEmail } from '@/lib/email/email-service';
import { rateLimiters } from '@/lib/security/rate-limiter';
import { prisma } from '@/lib/db';

const schema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const limit = rateLimiters.passwordReset(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 422 });
  }

  const result = await requestPasswordReset(parsed.data.email, ip);

  // Fire email only when a token was generated (user exists)
  if (result.success && result.data?.token) {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { name: true },
    });

    sendPasswordResetEmail({
      to: parsed.data.email,
      name: user?.name ?? 'Adventurer',
      token: result.data.token,
    }).catch((err) => console.error('[Email] Failed to send password reset email:', err));
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}
