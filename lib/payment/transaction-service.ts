/**
 * Transaction Service — Payment Transaction Management
 *
 * Manages payment transactions, records, status tracking,
 * and reconciliation between providers and internal records.
 */

import { prisma } from "@/lib/db";
import type { PaymentProvider } from "./payment-provider";
import type { PaymentStatus } from "@prisma/client";
import type { ServiceResult } from "@/lib/services/types";

export interface TransactionRecord {
  id: string;
  bookingId: string;
  gatewayName: string | null;
  gatewayTxnId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  paidAt: Date | null;
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
      gatewayTxnId: string;
      amount: number;
      currency: string;
      status: PaymentStatus;
      method: string;
    }
  ): Promise<ServiceResult<TransactionRecord>> {
    try {
      const tx = await prisma.payment.create({
        data: {
          bookingId: input.bookingId,
          gatewayName: input.provider,
          gatewayTxnId: input.gatewayTxnId,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
          method: input.method as any,
        },
      });

      return {
        success: true,
        data: {
          id: tx.id,
          bookingId: tx.bookingId,
          gatewayName: tx.gatewayName,
          gatewayTxnId: tx.gatewayTxnId,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          method: tx.method,
          paidAt: tx.paidAt,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        },
      };
    } catch (err) {
      console.error("[TransactionService] record error:", err);
      return { success: false, error: "Failed to record transaction." };
    }
  },

  async updateStatus(
    gatewayTxnId: string,
    status: PaymentStatus
  ): Promise<ServiceResult<TransactionRecord>> {
    try {
      const existing = await prisma.payment.findFirst({
        where: { gatewayTxnId },
      });
      if (!existing) {
        return { success: false, error: "Transaction not found." };
      }

      const tx = await prisma.payment.update({
        where: { id: existing.id },
        data: { status },
      });

      return {
        success: true,
        data: {
          id: tx.id,
          bookingId: tx.bookingId,
          gatewayName: tx.gatewayName,
          gatewayTxnId: tx.gatewayTxnId,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          method: tx.method,
          paidAt: tx.paidAt,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        },
      };
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
        .filter((t) => t.status === "UNPAID" || t.status === "PARTIAL")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        success: true,
        data: {
          transactions: transactions.map((tx) => ({
            id: tx.id,
            bookingId: tx.bookingId,
            gatewayName: tx.gatewayName,
            gatewayTxnId: tx.gatewayTxnId,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            method: tx.method,
            paidAt: tx.paidAt,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
          })),
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

  async getByGatewayTxnId(gatewayTxnId: string): Promise<ServiceResult<TransactionRecord>> {
    try {
      const tx = await prisma.payment.findFirst({
        where: { gatewayTxnId },
      });
      if (!tx) return { success: false, error: "Transaction not found." };
      return {
        success: true,
        data: {
          id: tx.id,
          bookingId: tx.bookingId,
          gatewayName: tx.gatewayName,
          gatewayTxnId: tx.gatewayTxnId,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          method: tx.method,
          paidAt: tx.paidAt,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        },
      };
    } catch (err) {
      console.error("[TransactionService] getByGatewayTxnId error:", err);
      return { success: false, error: "Failed to fetch transaction." };
    }
  },

  async processWebhookResult(
    result: {
      bookingRef: string;
      paymentIntentId: string;
      status: "success" | "failure" | "pending";
      amount?: number;
      currency?: string;
      event?: string;
      gatewayTxnId?: string;
    },
    provider: PaymentProvider
  ): Promise<ServiceResult<{ updated: boolean; bookingId?: string }>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef: result.bookingRef },
      });

      if (!booking) {
        return { success: false, error: "Booking not found for webhook." };
      }

      const status: PaymentStatus =
        result.status === "success"
          ? "PAID"
          : result.status === "failure"
          ? "FAILED"
          : "UNPAID";

      const existing = await prisma.payment.findFirst({
        where: { gatewayTxnId: result.paymentIntentId },
      });

      if (existing) {
        await prisma.payment.update({
          where: { id: existing.id },
          data: { status, updatedAt: new Date() },
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            gatewayName: provider,
            gatewayTxnId: result.paymentIntentId,
            amount: result.amount ?? 0,
            currency: result.currency ?? "USD",
            status,
            method: "BANK_TRANSFER",
            gatewayResponse: {
              event: result.event,
              gatewayTxnId: result.gatewayTxnId,
            },
          },
        });
      }

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
      const where: any = {};
      if (options.startDate || options.endDate) {
        where.createdAt = {};
        if (options.startDate) where.createdAt.gte = options.startDate;
        if (options.endDate) where.createdAt.lte = options.endDate;
      }
      if (options.provider) where.gatewayName = options.provider;

      const transactions = await prisma.payment.findMany({ where });

      const totalTransactions = transactions.length;
      const successful = transactions.filter((t) => t.status === "PAID");
      const failed = transactions.filter((t) => t.status === "FAILED");
      const refunded = transactions.filter((t) => t.status === "REFUNDED");
      const pending = transactions.filter((t) => t.status === "UNPAID" || t.status === "PARTIAL");

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
