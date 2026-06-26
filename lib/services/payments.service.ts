/**
 * Payment Service — Architecture Preparation (Phase 3)
 *
 * Defines the interface for multi-provider payment processing.
 * Stripe, PayPal, and SSLCommerz gateway implementations will
 * be added in a dedicated payments phase.
 *
 * The Payment model in the database schema is ready to receive
 * gateway transaction data when integration is built.
 */

import type { ServiceResult } from './types';
import type { PaymentMethod } from '@prisma/client';

export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'SSLCOMMERZ' | 'BANK_TRANSFER';

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'failed';
  clientSecret?: string;
  redirectUrl?: string;
  metadata: Record<string, string>;
}

export interface RefundResult {
  id: string;
  provider: PaymentProvider;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface IPaymentService {
  createPaymentIntent(params: {
    bookingId: string;
    amount: number;
    currency: string;
    provider: PaymentProvider;
    customerEmail: string;
  }): Promise<ServiceResult<PaymentIntent>>;

  confirmPayment(params: {
    paymentIntentId: string;
    provider: PaymentProvider;
  }): Promise<ServiceResult<PaymentIntent>>;

  refund(params: {
    paymentId: string;
    provider: PaymentProvider;
    amount?: number;
    reason?: string;
  }): Promise<ServiceResult<RefundResult>>;

  handleWebhook(params: {
    provider: PaymentProvider;
    payload: unknown;
    signature: string;
  }): Promise<ServiceResult<{ event: string; bookingId: string }>>;
}

// Payment method labels for UI display
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  STRIPE: 'Credit / Debit Card (Stripe)',
  PAYPAL: 'PayPal',
  SSLCOMMERZ: 'SSLCommerz (Bangladesh)',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  COUPON_ONLY: 'Coupon Only',
};
