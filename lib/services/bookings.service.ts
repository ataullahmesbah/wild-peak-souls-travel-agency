import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse } from '@/lib/services/types';
import type { Booking, BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { generateSecureToken } from '@/lib/security/tokens';

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
    event: { select: { id: true; title: true; slug: true; startDate: true } };
    tour: { select: { id: true; title: true; slug: true } };
    participants: true;
    invoice: true;
  };
}>;

export interface CreateBookingInput {
  userId: string;
  eventId?: string;
  tourId?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  travelDate?: Date;
  returnDate?: Date;
  unitPrice: number;
  childPrice?: number;
  discountAmount?: number;
  couponCode?: string;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  specialRequests?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface BookingParticipantInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNo?: string;
  passportExpiry?: Date;
  isLead?: boolean;
  dietaryNeeds?: string;
  medicalInfo?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const random = generateSecureToken(3).toUpperCase();
  return `WPS-${year}-${random}`;
}

export const bookingService = {
  async create(
    input: CreateBookingInput,
    participants: BookingParticipantInput[] = [],
  ): Promise<ServiceResult<BookingWithRelations>> {
    try {
      // Validate seat availability if booking an event
      if (input.eventId) {
        const event = await prisma.event.findUnique({
          where: { id: input.eventId },
          select: { availableSeats: true, maximumCapacity: true, currentBookings: true, status: true },
        });

        if (!event) return { success: false, error: 'Event not found.' };
        if (event.status === 'SOLDOUT' || event.status === 'CANCELLED') {
          return { success: false, error: 'This event is no longer available for booking.' };
        }

        const capacity = event.availableSeats ?? event.maximumCapacity;
        const totalRequested =
          (input.adultCount ?? 1) + (input.childCount ?? 0) + (input.infantCount ?? 0);

        if (capacity && event.currentBookings + totalRequested > capacity) {
          return { success: false, error: 'Not enough seats available for the requested number of participants.' };
        }
      }

      const totalParticipants =
        (input.adultCount ?? 1) + (input.childCount ?? 0) + (input.infantCount ?? 0);

      const booking = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            bookingRef: generateBookingRef(),
            userId: input.userId,
            eventId: input.eventId,
            tourId: input.tourId,
            adultCount: input.adultCount ?? 1,
            childCount: input.childCount ?? 0,
            infantCount: input.infantCount ?? 0,
            totalParticipants,
            travelDate: input.travelDate,
            returnDate: input.returnDate,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            unitPrice: input.unitPrice,
            childPrice: input.childPrice,
            discountAmount: input.discountAmount ?? 0,
            couponCode: input.couponCode,
            taxAmount: input.taxAmount ?? 0,
            totalAmount: input.totalAmount,
            currency: input.currency ?? 'USD',
            specialRequests: input.specialRequests,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          },
        });

        // Create participants if provided
        if (participants.length > 0) {
          await tx.bookingParticipant.createMany({
            data: participants.map((p, i) => ({
              bookingId: newBooking.id,
              ...p,
              isLead: i === 0 ? true : (p.isLead ?? false),
            })),
          });
        }

        // Update event seat count
        if (input.eventId) {
          await tx.event.update({
            where: { id: input.eventId },
            data: { currentBookings: { increment: totalParticipants } },
          });
        }

        // Update booking count on event/tour
        if (input.eventId) {
          await tx.event.update({
            where: { id: input.eventId },
            data: { bookingCount: { increment: 1 } },
          });
        }
        if (input.tourId) {
          await tx.tour.update({
            where: { id: input.tourId },
            data: { bookingCount: { increment: 1 } },
          });
        }

        // Update coupon usage
        if (input.couponCode) {
          await tx.coupon.update({
            where: { code: input.couponCode },
            data: { usageCount: { increment: 1 } },
          });
        }

        return tx.booking.findUniqueOrThrow({
          where: { id: newBooking.id },
          include: {
            user: { select: { id: true, name: true, email: true } },
            event: { select: { id: true, title: true, slug: true, startDate: true } },
            tour: { select: { id: true, title: true, slug: true } },
            participants: true,
            invoice: true,
          },
        });
      });

      return { success: true, data: booking };
    } catch (err) {
      console.error('[BookingService] create error:', err);
      return { success: false, error: 'Failed to create booking.' };
    }
  },

  async getByRef(bookingRef: string): Promise<ServiceResult<BookingWithRelations>> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingRef },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, slug: true, startDate: true } },
          tour: { select: { id: true, title: true, slug: true } },
          participants: true,
          invoice: true,
        },
      });

      if (!booking) return { success: false, error: 'Booking not found.' };
      return { success: true, data: booking };
    } catch (err) {
      console.error('[BookingService] getByRef error:', err);
      return { success: false, error: 'Failed to fetch booking.' };
    }
  },

  async getByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<ServiceResult<PaginatedResponse<Booking>>> {
    try {
      const skip = (page - 1) * limit;
      const where = { userId };
      const [total, data] = await Promise.all([
        prisma.booking.count({ where }),
        prisma.booking.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            event: { select: { id: true, title: true, slug: true, startDate: true, coverUrl: true } },
            tour: { select: { id: true, title: true, slug: true, coverUrl: true } },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        success: true,
        data: {
          data,
          pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        },
      };
    } catch (err) {
      console.error('[BookingService] getByUserId error:', err);
      return { success: false, error: 'Failed to fetch bookings.' };
    }
  },

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    internalNotes?: string,
  ): Promise<ServiceResult<Booking>> {
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status, ...(internalNotes && { internalNotes }) },
      });
      return { success: true, data: booking };
    } catch (err) {
      console.error('[BookingService] updateStatus error:', err);
      return { success: false, error: 'Failed to update booking status.' };
    }
  },

  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: PaymentStatus,
  ): Promise<ServiceResult<Booking>> {
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus },
      });
      return { success: true, data: booking };
    } catch (err) {
      console.error('[BookingService] updatePaymentStatus error:', err);
      return { success: false, error: 'Failed to update payment status.' };
    }
  },

  async cancel(bookingId: string, reason?: string): Promise<ServiceResult<Booking>> {
    try {
      const existing = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { status: true, eventId: true, totalParticipants: true },
      });

      if (!existing) return { success: false, error: 'Booking not found.' };
      if (existing.status === 'CANCELLED') return { success: false, error: 'Booking is already cancelled.' };

      const booking = await prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            internalNotes: reason ? `Cancelled: ${reason}` : undefined,
          },
        });

        // Release event seats
        if (existing.eventId) {
          await tx.event.update({
            where: { id: existing.eventId },
            data: {
              currentBookings: { decrement: existing.totalParticipants },
            },
          });
        }

        return updated;
      });

      return { success: true, data: booking };
    } catch (err) {
      console.error('[BookingService] cancel error:', err);
      return { success: false, error: 'Failed to cancel booking.' };
    }
  },
};
