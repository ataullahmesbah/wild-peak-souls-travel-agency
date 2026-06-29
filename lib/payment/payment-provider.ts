/**
 * Payment Provider Interface
 * Multi-gateway payment architecture for Wild Peak Souls
 *
 * This interface defines the contract for all payment providers.
 * New providers (Stripe, SSLCommerz, etc.) implement this interface.
 */

import type { ServiceResult } from "@/lib/services/types";

export type PaymentProvider = "STRIPE" | "SSLCOMMERZ" | "PAYPAL" | "BANK_TRANSFER";

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "requires_confirmation" | "succeeded" | "failed" | "pending";
  clientSecret?: string;
  redirectUrl?: string;
  paymentUrl?: string;
  metadata: Record<string, string>;
  expiresAt?: Date;
  createdAt: Date;
}

export interface RefundResult {
  id: string;
  provider: PaymentProvider;
  amount: number;
  status: "pending" | "succeeded" | "failed";
  reason?: string;
  processedAt?: Date;
}

export interface CreatePaymentIntentInput {
  bookingRef: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  gatewayTxnId?: string;
  gatewayResponse?: unknown;
}

export interface RefundInput {
  paymentId: string;
  gatewayTxnId: string;
  amount?: number;
  reason?: string;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  payload: unknown;
  signature: string;
  rawBody: string;
}

export interface WebhookResult {
  event: string;
  bookingRef: string;
  paymentIntentId: string;
  status: "success" | "failure" | "pending";
  amount?: number;
  currency?: string;
  gatewayTxnId?: string;
}

export interface IPaymentProvider {
  readonly name: PaymentProvider;
  readonly isEnabled: boolean;

  createPaymentIntent(
    params: CreatePaymentIntentInput
  ): Promise<ServiceResult<PaymentIntent>>;

  confirmPayment(
    params: ConfirmPaymentInput
  ): Promise<ServiceResult<PaymentIntent>>;

  refund(
    params: RefundInput
  ): Promise<ServiceResult<RefundResult>>;

  verifyWebhook(
    payload: WebhookPayload
  ): Promise<ServiceResult<WebhookResult>>;

  getConfig(): PaymentProviderConfig;
}

export interface PaymentProviderConfig {
  name: PaymentProvider;
  enabled: boolean;
  testMode: boolean;
  currencies: string[];
  features: {
    cardPayments: boolean;
    bankTransfer: boolean;
    mobileWallet: boolean;
    recurringPayments: boolean;
    refunds: boolean;
    webhooks: boolean;
  };
  // Public config only — never expose secrets
  publicKey?: string;
  publicConfig?: Record<string, unknown>;
}

export interface PaymentSettings {
  defaultProvider: PaymentProvider;
  providers: Record<PaymentProvider, PaymentProviderConfig>;
  taxRate: number;
  currency: string;
  depositPercentage: number;
  cancellationPolicy: {
    fullRefundDays: number;
    partialRefundDays: number;
    partialRefundPercentage: number;
  };
}
