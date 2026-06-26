'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const registered = searchParams.get('registered');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    setStatus('loading');

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(json.message);
        } else {
          setStatus('error');
          setMessage(json.error ?? 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  // Just registered — show instructions
  if (registered && !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-mountain-50/40 to-background dark:from-mountain-900/10">
        <div className="w-full max-w-md space-y-8 text-center">
          <Logo className="mx-auto" />
          <div className="rounded-2xl border border-mountain-200 bg-mountain-50/50 p-8 dark:border-mountain-800 dark:bg-mountain-900/20">
            <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="font-display text-2xl font-bold">Check your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              The link expires in 24 hours. Check your spam folder if you don't see it.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Already verified?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-mountain-50/40 to-background dark:from-mountain-900/10">
      <div className="w-full max-w-md space-y-8 text-center">
        <Logo className="mx-auto" />

        {status === 'loading' && (
          <div className="rounded-2xl border border-border p-8 space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-2xl border border-success/20 bg-success/5 p-8 space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="font-display text-2xl font-bold">Email verified!</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button asChild className="mt-2 w-full">
              <Link href="/login">Continue to Sign In</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="font-display text-2xl font-bold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        )}

        {status === 'idle' && !token && (
          <div className="rounded-2xl border border-border p-8">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No verification token found in this URL.</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
