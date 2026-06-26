import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyEmail } from '@/lib/auth/auth-service';
import { sendWelcomeEmail } from '@/lib/email/email-service';
import { prisma } from '@/lib/db';

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid token is required.' }, { status: 422 });
  }

  const result = await verifyEmail(parsed.data.token);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.data?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: result.data.userId },
      select: { email: true, name: true },
    });

    if (user) {
      sendWelcomeEmail({ to: user.email, name: user.name ?? 'Adventurer' }).catch(
        (err) => console.error('[Email] Failed to send welcome email:', err),
      );
    }
  }

  return NextResponse.json({ message: 'Email verified successfully. Welcome to Wild Peak Souls!' });
}
