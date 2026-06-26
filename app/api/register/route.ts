import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/auth/auth-service';
import { sendVerificationEmail } from '@/lib/email/email-service';
import { rateLimiters } from '@/lib/security/rate-limiter';
import { AUTH_VALIDATION } from '@/lib/constants/validation';

const registerSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(AUTH_VALIDATION.PASSWORD_MIN_LENGTH)
    .max(AUTH_VALIDATION.PASSWORD_MAX_LENGTH)
    .regex(
      AUTH_VALIDATION.PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    ),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Rate limit
  const limit = rateLimiters.register(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const result = await registerUser({ ...parsed.data, ipAddress: ip });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  // Fire and forget — never block registration on email failure
  if (result.data) {
    sendVerificationEmail({
      to: parsed.data.email,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      token: result.data.verificationToken,
    }).catch((err) => console.error('[Email] Failed to send verification email:', err));
  }

  return NextResponse.json(
    { message: 'Account created. Please check your email to verify your account.' },
    { status: 201 },
  );
}
