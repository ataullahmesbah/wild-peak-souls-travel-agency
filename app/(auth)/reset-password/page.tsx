'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/layout/logo';
import { AUTH_VALIDATION } from '@/lib/constants/validation';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    password: z
      .string()
      .min(AUTH_VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} characters.`)
      .max(AUTH_VALIDATION.PASSWORD_MAX_LENGTH)
      .regex(AUTH_VALIDATION.PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof schema>;

const requirements = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /\d/.test(v) },
  { label: 'Special character', test: (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <Logo />
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 max-w-md">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="text-lg font-semibold">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-muted-foreground">This password reset link is invalid or has expired.</p>
          <Button asChild className="mt-6 w-full">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetForm) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Failed to reset password. The link may have expired.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login?reset=success'), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-mountain-50/40 to-background dark:from-mountain-900/10">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Reset your password</h1>
            <p className="mt-2 text-muted-foreground">Enter a strong new password for your account.</p>
          </div>
        </div>

        {success ? (
          <div className="rounded-2xl border border-success/20 bg-success/5 p-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <div>
              <h2 className="text-lg font-semibold">Password reset!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been updated. Redirecting you to sign in...
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('password', {
                      onChange: (e) => setPasswordValue(e.target.value),
                    })}
                    className="pr-10"
                    aria-invalid={!!errors.password}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                {passwordValue && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {requirements.map((req) => {
                      const met = req.test(passwordValue);
                      return (
                        <div key={req.label} className={cn('flex items-center gap-1.5 text-xs', met ? 'text-success' : 'text-muted-foreground')}>
                          <div className={cn('h-1.5 w-1.5 rounded-full', met ? 'bg-success' : 'bg-muted-foreground/40')} />
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
