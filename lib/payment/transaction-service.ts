/**
 * Transaction Service — Payment Transaction Management
 *
 * Manages payment transactions, records, status tracking,
 * and reconciliation between providers and internal records.
 */

import { prisma } from "@/lib/db";
import type { PaymentProvider, PaymentIntent, WebhookResult } from "./payment-provider";
import type { PaymentStatus } from "@prisma/client";
import type { ServiceResult } from "@/lib/services/types";

export interface TransactionRecord {
  id: string;
  bookingId: string;
  provider: PaymentProvider;
  providerTxnId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionHistory {
  transactions: TransactionRecord[];
  totalPaid: number;
  totalRefunded: number;
  totalPending: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalRevenue: number;
  successfulCount: number;
  failedCount: number;
  refundedCount: number;
  pendingCount: number;
  currency: string;
}

export const transactionService = {
  async recordTransaction(
    input: {
      bookingId: string;
      provider: PaymentProvider;
      providerTxnId: string;
      amount: number;
      currency: string;
      status: PaymentStatus;
      method: string;
      metadata?: Record<string, string>;
    }
  ): Promise<ServiceResult<TransactionRecord>> {
    try {
      const tx = await prisma.payment.create({
        data: {
          bookingId: input.bookingId,
          provider: input.provider,
          providerTxnId: input.providerTxnId,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
          method: input.method,
          metadata: input.metadata ?? {},
        },
      });

      return { success: true, data: tx as TransactionRecord };
    } catch (err) {
      console.error("[TransactionService] record error:", err);
      return { success: false, error: "Failed to record transaction." };
    }
  },

  async updateStatus(
    providerTxnId: string,
    status: PaymentStatus,
    metadata?: Record<string, string>
  ): Promise<ServiceResult<TransactionRecord>> {
    try {
      const tx = await prisma.payment.update({
        where: { providerTxnId },
        data: { status, metadata: metadata ? { ...metadata } : undefined },
      });

      return { success: true, data: tx as TransactionRecord };
    } catch (err) {
      console.error("[TransactionService] updateStatus error:", err);
      return { success: false, error: "Failed to update transaction status." };
    }
  },

  async getByBookingId(bookingId: string): Promise<ServiceResult<TransactionHistory>> {
    try {
      const transactions = await prisma.payment.findMany({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
      });

      const totalPaid = transactions
        .filter((t) => t.status === "PAID")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalRefunded = transactions
        .filter((t) => t.status === "REFUNDED")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPending = transactions
        .filter((t) => t.status === "UNPAID" || t.status === "PENDING")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        success: true,
        data: {
          transactions: transactions as TransactionRecord[],
          totalPaid,
          totalRefunded,
          totalPending,
        },
      };
    } catch (err) {
      console.error("[TransactionService] getByBookingId error:", err);
      return { success: false, error: "Failed to fetch transaction history." };
    }
  },

  async getByProviderTxnId(providerTxnId: string): Promise<ServiceResult<TransactionRecord>> {
    try {
      const tx = await prisma.payment.findUnique({
        where: { providerTxnId },
      });
      if (!tx) return { success: false, error: "Transaction not found." };
      return { success: true, data: tx as TransactionRecord };
    } catch (err) {
      console.error("[TransactionService] getByProviderTxnId error:", err);
      return { success: false, error: "Failed to fetch transaction." };
    }
  },

  async processWebhookResult(
    result: WebhookResult,
    provider: PaymentProvider
  ): Promise<ServiceResult<{ updated: boolean; bookingId?: string }>> {
    try {
      // Find the booking by reference
      const booking = await prisma.booking.findUnique({
        where: { bookingRef: result.bookingRef },
      });

      if (!booking) {
        return { success: false, error: "Booking not found for webhook." };
      }

      // Record or update the transaction
      const existing = await prisma.payment.findFirst({
        where: { providerTxnId: result.paymentIntentId },
      });

      const status: PaymentStatus =
        result.status === "success"
          ? "PAID"
          : result.status === "failure"
          ? "FAILED"
          : "PENDING";

      if (existing) {
        await prisma.payment.update({
          where: { id: existing.id },
          data: { status, updatedAt: new Date() },
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            provider,
            providerTxnId: result.paymentIntentId,
            amount: result.amount ?? 0,
            currency: result.currency ?? "USD",
            status,
            method: "CARD",
            metadata: { event: result.event, gatewayTxnId: result.gatewayTxnId ?? "" },
          },
        });
      }

      // Update booking payment status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: status,
          ...(status === "PAID" ? { status: "CONFIRMED" } : {}),
          ...(status === "FAILED" ? { status: "PENDING" } : {}),
        },
      });

      return { success: true, data: { updated: true, bookingId: booking.id } };
    } catch (err) {
      console.error("[TransactionService] processWebhookResult error:", err);
      return { success: false, error: "Failed to process webhook result." };
    }
  },

  async getSummary(
    options: {
      startDate?: Date;
      endDate?: Date;
      provider?: PaymentProvider;
    } = {}
  ): Promise<ServiceResult<TransactionSummary>> {
    try {
      const where: Record<string, unknown> = {};
      if (options.startDate || options.endDate) {
        where.createdAt = {};
        if (options.startDate) (where.createdAt as Record<string, Date>).gte = options.startDate;
        if (options.endDate) (where.createdAt as Record<string, Date>).lte = options.endDate;
      }
      if (options.provider) where.provider = options.provider;

      const transactions = await prisma.payment.findMany({ where });

      const totalTransactions = transactions.length;
      const successful = transactions.filter((t) => t.status === "PAID");
      const failed = transactions.filter((t) => t.status === "FAILED");
      const refunded = transactions.filter((t) => t.status === "REFUNDED");
      const pending = transactions.filter((t) => t.status === "UNPAID" || t.status === "PENDING");

      const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);

      return {
        success: true,
        data: {
          totalTransactions,
          totalRevenue,
          successfulCount: successful.length,
          failedCount: failed.length,
          refundedCount: refunded.length,
          pendingCount: pending.length,
          currency: "USD",
        },
      };
    } catch (err) {
      console.error("[TransactionService] getSummary error:", err);
      return { success: false, error: "Failed to generate transaction summary." };
    }
  },
};
