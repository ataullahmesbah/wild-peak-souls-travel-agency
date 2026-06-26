/**
 * Email Service — Nodemailer-based transactional email.
 *
 * Configure SMTP credentials in .env.local.
 * For production, use a service like SendGrid, Resend, or AWS SES.
 */

import nodemailer from 'nodemailer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Transporter = any;

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

const FROM = `${process.env.SMTP_FROM_NAME ?? 'Wild Peak Souls'} <${process.env.SMTP_FROM_EMAIL ?? 'noreply@wildpeaksouls.com'}>`;
const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${params.token}`;

  await getTransporter().sendMail({
    from: FROM,
    to: params.to,
    subject: 'Verify your Wild Peak Souls account',
    html: buildVerificationEmailHtml({ name: params.name, url }),
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${params.token}`;

  await getTransporter().sendMail({
    from: FROM,
    to: params.to,
    subject: 'Reset your Wild Peak Souls password',
    html: buildPasswordResetEmailHtml({ name: params.name, url }),
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  await getTransporter().sendMail({
    from: FROM,
    to: params.to,
    subject: `Welcome to Wild Peak Souls, ${params.name}!`,
    html: buildWelcomeEmailHtml({ name: params.name }),
  });
}

// ─── Email Templates ──────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wild Peak Souls</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2d6a4f,#1a4a6e);padding:32px 40px;">
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Wild Peak Souls</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Premium Adventure Travel</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${content}</td></tr>
        <tr>
          <td style="padding:24px 40px;background:#f9f9f7;border-top:1px solid #e8e8e0;">
            <p style="margin:0;font-size:12px;color:#888;">You received this email because you signed up for Wild Peak Souls. If you didn't create an account, you can safely ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildVerificationEmailHtml(p: { name: string; url: string }): string {
  return emailWrapper(`
<h2 style="margin:0 0 16px;color:#1a2e1a;font-size:22px;">Verify Your Email Address</h2>
<p style="color:#555;margin:0 0 24px;">Hi ${p.name}, welcome to Wild Peak Souls! Please verify your email to activate your account.</p>
<a href="${p.url}" style="display:inline-block;padding:14px 28px;background:#2d6a4f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Verify Email Address</a>
<p style="color:#888;margin:24px 0 0;font-size:13px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
<p style="color:#aaa;margin:8px 0 0;font-size:12px;word-break:break-all;">Or copy: ${p.url}</p>`);
}

function buildPasswordResetEmailHtml(p: { name: string; url: string }): string {
  return emailWrapper(`
<h2 style="margin:0 0 16px;color:#1a2e1a;font-size:22px;">Reset Your Password</h2>
<p style="color:#555;margin:0 0 24px;">Hi ${p.name}, we received a request to reset your password. Click the button below to create a new one.</p>
<a href="${p.url}" style="display:inline-block;padding:14px 28px;background:#2d6a4f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Reset Password</a>
<p style="color:#888;margin:24px 0 0;font-size:13px;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>`);
}

function buildWelcomeEmailHtml(p: { name: string }): string {
  return emailWrapper(`
<h2 style="margin:0 0 16px;color:#1a2e1a;font-size:22px;">Welcome to the Adventure, ${p.name}!</h2>
<p style="color:#555;margin:0 0 16px;">Your account is now active. Start exploring breathtaking destinations, book guided expeditions, and connect with expert guides.</p>
<a href="${APP_URL}/destinations" style="display:inline-block;padding:14px 28px;background:#2d6a4f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Explore Destinations</a>`);
}
