/**
 * Refund Service — Automated Refund Processing
 *
 * Handles refund calculations, eligibility checks,
 * and provider refund execution.
 */

import { prisma } from "@/lib/db";
import { paymentManager } from "./payment-manager";
import type { PaymentProvider } from "./payment-provider";
import type { ServiceResult } from "@/lib/services/types";
import { defaultPaymentSettings } from "./payment-manager";

export interface RefundRequest {
  bookingId: string;
  amount?: number; // Full refund if omitted
  reason: string;
  processedById: string;
}

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
  providerTxnId?: string;
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
          event: { select: { startDate: true } },
          tour: { select: { startDate: true } },
        },
      });

      if (!booking) {
        return { success: false, error: "Booking not found." };
      }

      const travelDate = booking.travelDate || booking.event?.startDate || booking.tour?.startDate;
      if (!travelDate) {
        return { success: false, error: "No travel date found for booking." };
      }

      const daysUntil = Math.ceil((new Date(travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const policy = defaultPaymentSettings.cancellationPolicy;
      const originalAmount = booking.totalAmount;

      let eligible = false;
      let refundAmount = 0;
      let penaltyAmount = 0;
      let policyApplied: "full" | "partial" | "none" = "none";
      let reason = "";

      if (daysUntil >= policy.fullRefundDays) {
        eligible = true;
        refundAmount = requestedAmount ?? originalAmount;
        penaltyAmount = 0;
        policyApplied = "full";
        reason = `Full refund: ${daysUntil} days before travel (policy: ${policy.fullRefundDays}+ days)`;
      } else if (daysUntil >= policy.partialRefundDays) {
        eligible = true;
        const maxRefund = originalAmount * (policy.partialRefundPercentage / 100);
        refundAmount = requestedAmount ? Math.min(requestedAmount, maxRefund) : maxRefund;
        penaltyAmount = originalAmount - refundAmount;
        policyApplied = "partial";
        reason = `Partial refund: ${daysUntil} days before travel (policy: ${policy.partialRefundDays}-${policy.fullRefundDays} days = ${policy.partialRefundPercentage}%)`;
      } else if (daysUntil >= 0) {
        eligible = false;
        refundAmount = 0;
        penaltyAmount = originalAmount;
        policyApplied = "none";
        reason = `No refund: ${daysUntil} days before travel (within ${policy.partialRefundDays} days)`;
      } else {
        // Already traveled
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
    request: RefundRequest,
    provider: PaymentProvider
  ): Promise<ServiceResult<RefundRecord>> {
    try {
      const calc = await this.calculateRefund(request.bookingId, request.amount);
      if (!calc.success || !calc.data) {
        return { success: false, error: calc.error || "Refund calculation failed." };
      }

      if (!calc.data.eligible) {
        return { success: false, error: calc.data.reason || "Booking is not eligible for refund." };
      }

      // Find the original payment
      const payment = await prisma.payment.findFirst({
        where: { bookingId: request.bookingId, status: "PAID" },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        return { success: false, error: "No paid transaction found for this booking." };
      }

      // Process refund through provider
      const refundResult = await paymentManager.processRefund(provider, {
        paymentId: payment.id,
        gatewayTxnId: payment.providerTxnId,
        amount: calc.data.refundAmount,
        reason: request.reason,
      });

      if (!refundResult.success || !refundResult.data) {
        return { success: false, error: refundResult.error || "Refund failed." };
      }

      // Record refund
      const refund = await prisma.refund.create({
        data: {
          bookingId: request.bookingId,
          paymentId: payment.id,
          amount: calc.data.refundAmount,
          reason: request.reason,
          status: refundResult.data.status === "succeeded" ? "SUCCEEDED" : "PENDING",
          processedById: request.processedById,
          processedAt: new Date(),
          providerTxnId: refundResult.data.id,
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: request.bookingId },
        data: {
          paymentStatus: refundResult.data.status === "succeeded" ? "REFUNDED" : "PENDING",
          status: refundResult.data.status === "succeeded" ? "CANCELLED" : "PENDING",
        },
      });

      // Update payment record
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: refundResult.data.status === "succeeded" ? "REFUNDED" : "PENDING",
          metadata: { refundReason: request.reason, refundAmount: calc.data.refundAmount },
        },
      });

      return {
        success: true,
        data: {
          id: refund.id,
          bookingId: request.bookingId,
          amount: calc.data.refundAmount,
          reason: request.reason,
          status: refundResult.data.status === "succeeded" ? "succeeded" : "pending",
          processedById: request.processedById,
          processedAt: new Date(),
          providerTxnId: refundResult.data.id,
        },
      };
    } catch (err) {
      console.error("[RefundService] processRefund error:", err);
      return { success: false, error: "Failed to process refund." };
    }
  },

  async getRefundHistory(bookingId: string): Promise<ServiceResult<RefundRecord[]>> {
    try {
      const refunds = await prisma.refund.findMany({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: refunds.map((r) => ({
          id: r.id,
          bookingId: r.bookingId,
          amount: r.amount,
          reason: r.reason,
          status: r.status.toLowerCase() as "pending" | "succeeded" | "failed",
          processedById: r.processedById,
          processedAt: r.processedAt ?? undefined,
          providerTxnId: r.providerTxnId ?? undefined,
        })),
      };
    } catch (err) {
      console.error("[RefundService] getRefundHistory error:", err);
      return { success: false, error: "Failed to fetch refund history." };
    }
  },
};
