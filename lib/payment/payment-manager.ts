/**
 * Payment Manager — Centralized payment orchestration
 *
 * Routes payment operations to the correct provider.
 * Handles payment creation, confirmation, refunds, and webhook processing.
 */

import type {
  IPaymentProvider,
  PaymentProvider,
  PaymentIntent,
  RefundResult,
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundInput,
  WebhookPayload,
  WebhookResult,
  PaymentSettings,
} from "./payment-provider";

import { stripeProvider } from "./stripe-provider";
import { sslCommerzProvider } from "./sslcommerz-provider";
import type { ServiceResult } from "@/lib/services/types";

const providers: Record<PaymentProvider, IPaymentProvider> = {
  STRIPE: stripeProvider,
  SSLCOMMERZ: sslCommerzProvider,
  PAYPAL: stripeProvider, // Placeholder — replace with PayPalProvider when implemented
  BANK_TRANSFER: stripeProvider, // Placeholder
};

export const defaultPaymentSettings: PaymentSettings = {
  defaultProvider: "STRIPE",
  providers: {
    STRIPE: stripeProvider.getConfig(),
    SSLCOMMERZ: sslCommerzProvider.getConfig(),
    PAYPAL: {
      name: "PAYPAL",
      enabled: false,
      testMode: true,
      currencies: ["USD", "EUR", "GBP"],
      features: {
        cardPayments: true,
        bankTransfer: false,
        mobileWallet: true,
        recurringPayments: false,
        refunds: true,
        webhooks: true,
      },
    },
    BANK_TRANSFER: {
      name: "BANK_TRANSFER",
      enabled: false,
      testMode: false,
      currencies: ["USD", "EUR", "NPR", "BDT"],
      features: {
        cardPayments: false,
        bankTransfer: true,
        mobileWallet: false,
        recurringPayments: false,
        refunds: false,
        webhooks: false,
      },
    },
  },
  taxRate: 0.13,
  currency: "USD",
  depositPercentage: 20,
  cancellationPolicy: {
    fullRefundDays: 30,
    partialRefundDays: 14,
    partialRefundPercentage: 50,
  },
};

export const paymentManager = {
  getProvider(provider: PaymentProvider): IPaymentProvider {
    const p = providers[provider];
    if (!p) {
      throw new Error(`Payment provider ${provider} not found.`);
    }
    return p;
  },

  getAvailableProviders(): PaymentProvider[] {
    return (Object.keys(providers) as PaymentProvider[]).filter(
      (p) => providers[p].isEnabled
    );
  },

  async createPayment(
    provider: PaymentProvider,
    params: CreatePaymentIntentInput
  ): Promise<ServiceResult<PaymentIntent>> {
    try {
      const p = this.getProvider(provider);
      if (!p.isEnabled) {
        return {
          success: false,
          error: `${provider} is not enabled. Please configure the provider credentials.`,
        };
      }
      return await p.createPaymentIntent(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment creation failed",
      };
    }
  },

  async confirmPayment(
    provider: PaymentProvider,
    params: ConfirmPaymentInput
  ): Promise<ServiceResult<PaymentIntent>> {
    try {
      const p = this.getProvider(provider);
      return await p.confirmPayment(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment confirmation failed",
      };
    }
  },

  async processRefund(
    provider: PaymentProvider,
    params: RefundInput
  ): Promise<ServiceResult<RefundResult>> {
    try {
      const p = this.getProvider(provider);
      return await p.refund(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund processing failed",
      };
    }
  },

  async processWebhook(
    provider: PaymentProvider,
    payload: WebhookPayload
  ): Promise<ServiceResult<WebhookResult>> {
    try {
      const p = this.getProvider(provider);
      return await p.verifyWebhook(payload);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      };
    }
  },

  getSettings(): PaymentSettings {
    return defaultPaymentSettings;
  },

  calculateTotals(params: {
    basePrice: number;
    adultCount: number;
    childCount: number;
    childPrice?: number;
    discountAmount?: number;
    couponDiscount?: number;
    taxRate?: number;
  }): {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  } {
    const {
      basePrice,
      adultCount,
      childCount,
      childPrice = 0,
      discountAmount = 0,
      couponDiscount = 0,
      taxRate = defaultPaymentSettings.taxRate,
    } = params;

    const adultTotal = basePrice * adultCount;
    const childTotal = childPrice * childCount;
    const subtotal = adultTotal + childTotal;
    const discount = discountAmount + couponDiscount;
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = Math.round(afterDiscount * taxRate * 100) / 100;
    const total = Math.round((afterDiscount + tax) * 100) / 100;

    return { subtotal, discount, tax, total };
  },
};
