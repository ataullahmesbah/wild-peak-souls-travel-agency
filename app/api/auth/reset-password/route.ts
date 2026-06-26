import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPassword } from '@/lib/auth/auth-service';
import { AUTH_VALIDATION } from '@/lib/constants/validation';

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(AUTH_VALIDATION.PASSWORD_MIN_LENGTH)
    .max(AUTH_VALIDATION.PASSWORD_MAX_LENGTH)
    .regex(AUTH_VALIDATION.PASSWORD_REGEX, 'Password does not meet security requirements.'),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const result = await resetPassword(parsed.data.token, parsed.data.password, ip);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: 'Password has been reset successfully.' });
}
