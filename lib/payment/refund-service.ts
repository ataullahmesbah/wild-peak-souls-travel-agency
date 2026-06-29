/**
 * Refund Service — Automated Refund Processing
 *
 * Handles refund calculations, eligibility checks,
 * and refund execution using the Payment model.
 */

import { prisma } from "@/lib/db";
import { paymentManager } from "./payment-manager";
import type { PaymentProvider } from "./payment-provider";
import type { ServiceResult } from "@/lib/services/types";

export interface RefundCalculation {
  eligible: boolean;
  reason?: string;
  originalAmount: number;
  refundAmount: number;
  penaltyAmount: number;
  daysUntilTravel: number;
  policyApplied: "full" | "partial" | "none";
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: "pending" | "succeeded" | "failed";
  processedById: string;
  processedAt?: Date;
  gatewayTxnId?: string;
  errorMessage?: string;
}

export const refundService = {
  async calculateRefund(
    bookingId: string,
    requestedAmount?: number
  ): Promise<ServiceResult<RefundCalculation>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          event: true,
          tour: true,
        },
      });

      if (!booking) {
        return { success: false, error: "Booking not found." };
      }

      const travelDate = booking.travelDate || (booking.event as any)?.startDate || (booking.tour as any)?.startDate;
      if (!travelDate) {
        return { success: false, error: "No travel date found for booking." };
      }

      const daysUntil = Math.ceil((new Date(travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const originalAmount = booking.totalAmount;

      let eligible = false;
      let refundAmount = 0;
      let penaltyAmount = 0;
      let policyApplied: "full" | "partial" | "none" = "none";
      let reason = "";

      if (daysUntil >= 30) {
        eligible = true;
        refundAmount = requestedAmount ?? originalAmount;
        penaltyAmount = 0;
        policyApplied = "full";
        reason = `Full refund: ${daysUntil} days before travel (30+ days policy)`;
      } else if (daysUntil >= 14) {
        eligible = true;
        const maxRefund = originalAmount * 0.5;
        refundAmount = requestedAmount ? Math.min(requestedAmount, maxRefund) : maxRefund;
        penaltyAmount = originalAmount - refundAmount;
        policyApplied = "partial";
        reason = `Partial refund: ${daysUntil} days before travel (14-30 days = 50%)`;
      } else if (daysUntil >= 0) {
        eligible = false;
        refundAmount = 0;
        penaltyAmount = originalAmount;
        policyApplied = "none";
        reason = `No refund: ${daysUntil} days before travel (within 14 days)`;
      } else {
        eligible = false;
        refundAmount = 0;
        penaltyAmount = originalAmount;
        policyApplied = "none";
        reason = "No refund: Travel date has already passed.";
      }

      return {
        success: true,
        data: {
          eligible,
          reason,
          originalAmount,
          refundAmount: Math.round(refundAmount * 100) / 100,
          penaltyAmount: Math.round(penaltyAmount * 100) / 100,
          daysUntilTravel: daysUntil,
          policyApplied,
        },
      };
    } catch (err) {
      console.error("[RefundService] calculate error:", err);
      return { success: false, error: "Failed to calculate refund." };
    }
  },

  async processRefund(
    bookingId: string,
    reason: string,
    processedById: string,
    provider: PaymentProvider,
    amount?: number
  ): Promise<ServiceResult<RefundRecord>> {
    try {
      const calc = await this.calculateRefund(bookingId, amount);
      if (!calc.success || !calc.data) {
        return { success: false, error: calc.error || "Refund calculation failed." };
      }

      if (!calc.data.eligible) {
        return { success: false, error: calc.data.reason || "Booking is not eligible for refund." };
      }

      // Find the original paid payment
      const payment = await prisma.payment.findFirst({
        where: { bookingId, status: "PAID" },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        return { success: false, error: "No paid transaction found for this booking." };
      }

      // Process refund through provider
      const refundResult = await paymentManager.processRefund(provider, {
        paymentId: payment.id,
        gatewayTxnId: payment.gatewayTxnId ?? "",
        amount: calc.data.refundAmount,
        reason,
      });

      if (!refundResult.success) {
        return { success: false, error: refundResult.error || "Refund failed." };
      }

      // Update the original payment with refund details
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          refundAmount: calc.data.refundAmount,
          refundReason: reason,
          refundedAt: new Date(),
        },
      });

      // Create a refund record as a new payment entry
      const refundPayment = await prisma.payment.create({
        data: {
          bookingId,
          amount: -calc.data.refundAmount,
          currency: payment.currency,
          status: "REFUNDED",
          method: payment.method,
          gatewayName: provider,
          refundReason: reason,
          refundedAt: new Date(),
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "REFUNDED",
          status: "CANCELLED",
        },
      });

      return {
        success: true,
        data: {
          id: refundPayment.id,
          bookingId,
          amount: calc.data.refundAmount,
          reason,
          status: "succeeded",
          processedById,
          processedAt: new Date(),
          gatewayTxnId: refundResult.data?.id,
        },
      };
    } catch (err) {
      console.error("[RefundService] processRefund error:", err);
      return { success: false, error: "Failed to process refund." };
    }
  },

  async getRefundHistory(bookingId: string): Promise<ServiceResult<RefundRecord[]>> {
    try {
      const refunds = await prisma.payment.findMany({
        where: { bookingId, status: "REFUNDED" },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: refunds.map((r) => ({
          id: r.id,
          bookingId: r.bookingId,
          amount: Math.abs(r.refundAmount ?? r.amount),
          reason: r.refundReason ?? "",
          status: "succeeded" as const,
          processedById: "",
          processedAt: r.refundedAt ?? undefined,
          gatewayTxnId: r.gatewayTxnId ?? undefined,
        })),
      };
    } catch (err) {
      console.error("[RefundService] getRefundHistory error:", err);
      return { success: false, error: "Failed to fetch refund history." };
    }
  },
};
