/**
 * SSLCommerz Provider — Architecture Preparation
 *
 * Bangladesh's largest payment gateway aggregator.
 * Supports: Visa, Mastercard, bKash, Nagad, Rocket, Upay, etc.
 *
 * To activate: add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSPHRASE to environment variables.
 */

import type {
  IPaymentProvider,
  PaymentIntent,
  RefundResult,
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundInput,
  WebhookPayload,
  WebhookResult,
  PaymentProviderConfig,
} from "./payment-provider";

import type { ServiceResult } from "@/lib/services/types";

export const SSLCOMMERZ_CONFIG: PaymentProviderConfig = {
  name: "SSLCOMMERZ",
  enabled: false,
  testMode: true,
  currencies: ["BDT", "USD"],
  features: {
    cardPayments: true,
    bankTransfer: false,
    mobileWallet: true,
    recurringPayments: false,
    refunds: false,
    webhooks: true,
  },
  publicKey: process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID,
  publicConfig: {
    baseUrl: process.env.SSLCOMMERZ_SANDBOX === "true"
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com",
    paymentUrl: "/gwprocess/v4/api.php",
    validationUrl: "/validator/api/validationserverAPI.php",
  },
};

export class SSLCommerzProvider implements IPaymentProvider {
  readonly name = "SSLCOMMERZ" as const;
  readonly isEnabled = Boolean(
    process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSPHRASE
  );

  private getBaseUrl(): string {
    return process.env.SSLCOMMERZ_SANDBOX === "true"
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";
  }

  private getCredentials() {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASSPHRASE;
    if (!storeId || !storePass) {
      throw new Error("SSLCommerz credentials not configured.");
    }
    return { storeId, storePass };
  }

  async createPaymentIntent(
    params: CreatePaymentIntentInput
  ): Promise<ServiceResult<PaymentIntent>> {
    try {
      const { storeId, storePass } = this.getCredentials();
      const baseUrl = this.getBaseUrl();

      // When implementing, call SSLCommerz init API:
      // POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php
      // {
      //   store_id, store_passwd, total_amount, currency,
      //   tran_id, success_url, fail_url, cancel_url,
      //   cus_name, cus_email, cus_phone, cus_add1, cus_city, cus_country,
      //   product_name, product_category, product_profile
      // }

      const tranId = `WPS-${Date.now()}`;

      return {
        success: true,
        data: {
          id: tranId,
          provider: "SSLCOMMERZ",
          amount: params.amount,
          currency: params.currency,
          status: "pending",
          redirectUrl: `${baseUrl}/gwprocess/v4/api.php`,
          paymentUrl: `${baseUrl}/gwprocess/v4/api.php`,
          metadata: {
            bookingRef: params.bookingRef,
            storeId,
            tranId,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SSLCommerz payment initiation failed",
      };
    }
  }

  async confirmPayment(
    params: ConfirmPaymentInput
  ): Promise<ServiceResult<PaymentIntent>> {
    try {
      const { storePass } = this.getCredentials();
      const baseUrl = this.getBaseUrl();

      // Validate transaction via SSLCommerz API:
      // GET https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
      // ?val_id={val_id}&store_id={store_id}&store_passwd={store_passwd}

      return {
        success: true,
        data: {
          id: params.paymentIntentId,
          provider: "SSLCOMMERZ",
          amount: 0,
          currency: "BDT",
          status: "succeeded",
          metadata: {},
          createdAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SSLCommerz payment validation failed",
      };
    }
  }

  async refund(
    params: RefundInput
  ): Promise<ServiceResult<RefundResult>> {
    return {
      success: false,
      error: "SSLCommerz does not support automated refunds via API. Please process refunds manually through the merchant dashboard.",
    };
  }

  async verifyWebhook(
    payload: WebhookPayload
  ): Promise<ServiceResult<WebhookResult>> {
    try {
      const { storePass } = this.getCredentials();
      const event = payload.payload as any;

      // SSLCommerz IPN payload:
      // {
      //   val_id, status, tran_date, tran_id, val_id,
      //   amount, store_amount, currency, bank_tran_id,
      //   card_type, card_no, card_issuer, card_brand,
      //   risk_level, risk_title
      // }

      const status = event?.status;
      const bookingRef = event?.tran_id?.replace(/^WPS-/, "") || "unknown";
      const tranId = event?.tran_id || "unknown";

      return {
        success: true,
        data: {
          event: status === "VALID" ? "payment.success" : "payment.failed",
          bookingRef,
          paymentIntentId: tranId,
          status: status === "VALID" ? "success" : "failure",
          amount: event?.amount ? parseFloat(event.amount) : undefined,
          currency: event?.currency,
          gatewayTxnId: event?.bank_tran_id,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SSLCommerz IPN verification failed",
      };
    }
  }

  getConfig(): PaymentProviderConfig {
    return SSLCOMMERZ_CONFIG;
  }
}

export const sslCommerzProvider = new SSLCommerzProvider();
