"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { bookingService } from "@/lib/services/bookings.service";
import { prisma } from "@/lib/db";
import { generateSecureToken } from "@/lib/security/tokens";

export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface CreateBookingAction {
  eventId?: string;
  tourId?: string;
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  travelDate: string;
  returnDate?: string;
  unitPrice: number;
  childPrice?: number;
  discountAmount?: number;
  couponCode?: string;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  specialRequests?: string;
  participants?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNo?: string;
    dietaryNeeds?: string;
    medicalInfo?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    isLead?: boolean;
  }[];
}

export async function createBookingAction(input: CreateBookingAction) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const userId = session.user.id;

  // Check for duplicate booking
  const existing = await prisma.booking.findFirst({
    where: {
      userId,
      OR: [
        input.eventId ? { eventId: input.eventId } : {},
        input.tourId ? { tourId: input.tourId } : {},
      ],
      status: { not: "CANCELLED" },
      travelDate: input.travelDate ? new Date(input.travelDate) : undefined,
    },
  });

  if (existing) {
    return { success: false, error: "You already have an active booking for this item." };
  }

  const result = await bookingService.create(
    {
      userId,
      eventId: input.eventId,
      tourId: input.tourId,
      adultCount: input.adultCount,
      childCount: input.childCount ?? 0,
      infantCount: input.infantCount ?? 0,
      travelDate: input.travelDate ? new Date(input.travelDate) : undefined,
      returnDate: input.returnDate ? new Date(input.returnDate) : undefined,
      unitPrice: input.unitPrice,
      childPrice: input.childPrice,
      discountAmount: input.discountAmount ?? 0,
      couponCode: input.couponCode,
      taxAmount: input.taxAmount ?? 0,
      totalAmount: input.totalAmount,
      currency: input.currency ?? "USD",
      specialRequests: input.specialRequests,
    },
    input.participants?.map((p) => ({
      ...p,
      dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
      isLead: p.isLead ?? false,
    })) ?? []
  );

  if (result.success) {
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function getMyBookingsAction(page = 1, limit = 10, status?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const result = await bookingService.getByUserId(session.user.id, page, limit);

  // Filter by status if provided
  if (status && result.success && result.data) {
    result.data.data = result.data.data.filter(
      (b) => b.status === status
    );
  }

  return result;
}

export async function getBookingByRefAction(bookingRef: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  return await bookingService.getByRef(bookingRef);
}

export async function cancelBookingAction(bookingId: string, reason?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  // Verify ownership
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
  });

  if (!booking) {
    return { success: false, error: "Booking not found or not authorized." };
  }

  const result = await bookingService.cancel(bookingId, reason);

  if (result.success) {
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function validateCouponAction(code: string, amount: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { success: false, error: "Invalid or expired coupon code." };
  }

  if (coupon.startsAt && new Date() < coupon.startsAt) {
    return { success: false, error: "Coupon is not yet active." };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { success: false, error: "Coupon has expired." };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, error: "Coupon usage limit reached." };
  }

  if (coupon.minimumAmount && amount < coupon.minimumAmount) {
    return { success: false, error: `Minimum booking amount is ${coupon.minimumAmount}.` };
  }

  const discountAmount =
    coupon.discountType === "PERCENTAGE"
      ? (amount * coupon.discountValue) / 100
      : coupon.discountValue;

  return {
    success: true,
    data: {
      code: coupon.code,
      type: coupon.discountType,
      value: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
    },
  };
}

export async function checkAvailabilityAction(
  eventId?: string,
  tourId?: string,
  date?: string,
  participants = 1
) {
  if (eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        availableSeats: true,
        maximumCapacity: true,
        currentBookings: true,
        status: true,
      },
    });

    if (!event) {
      return { success: false, error: "Event not found." };
    }

    if (event.status === "SOLDOUT" || event.status === "CANCELLED") {
      return { success: false, error: "Event is sold out or cancelled." };
    }

    const capacity = event.availableSeats ?? event.maximumCapacity;
    const available = (capacity ?? 0) - (event.currentBookings ?? 0);

    if (available < participants) {
      return { success: false, error: `Only ${available} seats available.` };
    }

    return { success: true, data: { available } };
  }

  if (tourId) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { status: true },
    });

    if (!tour) {
      return { success: false, error: "Tour not found." };
    }

    return { success: true, data: { available: true } };
  }

  return { success: false, error: "No event or tour specified." };
}
