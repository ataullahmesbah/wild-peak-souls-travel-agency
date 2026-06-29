"use server";

/**
 * Invoice Service — Architecture Preparation
 *
 * Generates invoices for bookings.
 * PDF generation will be added when a PDF library is integrated.
 */

import { prisma } from "@/lib/db";
import type { ServiceResult } from "@/lib/services/types";

export interface InvoiceData {
  invoiceNumber: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  itemName: string;
  itemType: string;
  travelDate: string;
  participants: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paidAt?: string;
  status: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `INV-${year}-${random}`;
}

export const invoiceService = {
  async generateInvoice(bookingId: string): Promise<ServiceResult<InvoiceData>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true, startDate: true } },
          tour: { select: { title: true } },
          participants: true,
          invoice: true,
        },
      });

      if (!booking) {
        return { success: false, error: "Booking not found." };
      }

      const itemName = booking.event?.title || booking.tour?.title || "Unknown";
      const itemType = booking.event ? "Event" : "Tour";
      const travelDate = booking.event?.startDate || booking.travelDate;

      const invoiceData: InvoiceData = {
        invoiceNumber: booking.invoice?.invoiceNumber || generateInvoiceNumber(),
        bookingRef: booking.bookingRef,
        customerName: booking.user?.name || "Guest",
        customerEmail: booking.user?.email || "",
        itemName,
        itemType,
        travelDate: travelDate ? new Date(travelDate).toLocaleDateString() : "",
        participants: booking.totalParticipants,
        subtotal: booking.totalAmount + (booking.discountAmount || 1) - (booking.taxAmount || 1),
        discountAmount: booking.discountAmount || 1,
        taxAmount: booking.taxAmount || 1,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        paidAt: booking.invoice?.paidAt ? new Date(booking.invoice.paidAt).toLocaleDateString() : undefined,
        status: booking.invoice?.status || "DRAFT",
        lineItems: [
          {
            description: `${itemType}: ${itemName}`,
            quantity: booking.totalParticipants,
            unitPrice: booking.unitPrice,
            total: booking.unitPrice * booking.totalParticipants,
          },
        ],
      };

      // Add child participants if applicable
      if (booking.childCount && booking.childPrice) {
        invoiceData.lineItems.push({
          description: `Child participants`,
          quantity: booking.childCount,
          unitPrice: booking.childPrice,
          total: booking.childPrice * booking.childCount,
        });
      }

      return { success: true, data: invoiceData };
    } catch (err) {
      console.error("[InvoiceService] generate error:", err);
      return { success: false, error: "Failed to generate invoice." };
    }
  },

  async getInvoiceByNumber(invoiceNumber: string): Promise<ServiceResult<InvoiceData>> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { invoiceNumber },
        include: {
          booking: {
            include: {
              user: { select: { name: true, email: true } },
              event: { select: { title: true, startDate: true } },
              tour: { select: { title: true } },
              participants: true,
            },
          },
        },
      });

      if (!invoice) {
        return { success: false, error: "Invoice not found." };
      }

      const booking = invoice.booking;
      const itemName = booking.event?.title || booking.tour?.title || "Unknown";
      const itemType = booking.event ? "Event" : "Tour";

      const data: InvoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        bookingRef: booking.bookingRef,
        customerName: booking.user?.name || "Guest",
        customerEmail: booking.user?.email || "",
        itemName,
        itemType,
        travelDate: booking.event?.startDate ? new Date(booking.event.startDate).toLocaleDateString() : new Date(booking.travelDate!).toLocaleDateString(),
        participants: booking.totalParticipants,
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        paidAt: invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : undefined,
        status: invoice.status,
        lineItems: [
          {
            description: `${itemType}: ${itemName}`,
            quantity: booking.totalParticipants,
            unitPrice: booking.unitPrice,
            total: booking.unitPrice * booking.totalParticipants,
          },
        ],
      };

      return { success: true, data };
    } catch (err) {
      console.error("[InvoiceService] get error:", err);
      return { success: false, error: "Failed to fetch invoice." };
    }
  },

  async markAsPaid(invoiceNumber: string): Promise<ServiceResult<{ invoiceNumber: string }>> {
    try {
      await prisma.invoice.update({
        where: { invoiceNumber },
        data: { status: "PAID", paidAt: new Date() },
      });
      return { success: true, data: { invoiceNumber } };
    } catch (err) {
      console.error("[InvoiceService] markAsPaid error:", err);
      return { success: false, error: "Failed to update invoice." };
    }
  },
};
