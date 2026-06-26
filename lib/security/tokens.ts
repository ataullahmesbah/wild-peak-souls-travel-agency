import { randomBytes, createHash } from 'crypto';

export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateNumericOTP(digits = 6): string {
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  return (Math.floor(Math.random() * (max - min)) + min).toString();
}
