import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
import type { Event, EventStatus, EventType, Prisma } from '@prisma/client';

export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    category: true;
    destination: true;
    country: true;
    city: true;
    schedules: true;
    itineraries: true;
    accommodations: true;
    meals: true;
    gallery: true;
    faqs: true;
  };
}>;

export interface CreateEventInput {
  title: string;
  slug: string;
  shortDescription?: string;
  overview?: string;
  coverUrl?: string;
  eventType?: EventType;
  categoryId?: string;
  destinationId?: string;
  countryId?: string;
  cityId?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  duration?: string;
  durationDays?: number;
  durationNights?: number;
  timezone?: string;
  availableSeats?: number;
  maximumCapacity?: number;
  startingPrice?: number;
  pricePerPerson?: number;
  groupPrice?: number;
  childPrice?: number;
  currency?: string;
  meetingPoint?: string;
  meetingPointUrl?: string;
  googleMapUrl?: string;
  latitude?: number;
  longitude?: number;
  includedItems?: string[];
  excludedItems?: string[];
  termsConditions?: string;
  cancellationPolicy?: string;
  refundPolicy?: string;
  isFeatured?: boolean;
  requiresApproval?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export interface EventListParams extends QueryParams {
  status?: EventStatus;
  eventType?: EventType;
  categoryId?: string;
  destinationId?: string;
  countryId?: string;
  isFeatured?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
}

// ─── Event Service ────────────────────────────────────────────────

export const eventService = {
  async list(
    params: EventListParams = {},
  ): Promise<ServiceResult<PaginatedResponse<Event>>> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        sort = 'createdAt',
        order = 'desc',
        status,
        eventType,
        categoryId,
        destinationId,
        countryId,
        isFeatured,
        startDateFrom,
        startDateTo,
      } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.EventWhereInput = {
        ...(status && { status }),
        ...(eventType && { eventType }),
        ...(categoryId && { categoryId }),
        ...(destinationId && { destinationId }),
        ...(countryId && { countryId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(startDateFrom || startDateTo
          ? {
              startDate: {
                ...(startDateFrom && { gte: startDateFrom }),
                ...(startDateTo && { lte: startDateTo }),
              },
            }
          : {}),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, data] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            category: { select: { id: true, name: true, slug: true, color: true } },
            country: { select: { id: true, name: true, code: true } },
            city: { select: { id: true, name: true } },
            _count: { select: { bookings: true, reviews: true } },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (err) {
      console.error('[EventService] list error:', err);
      return { success: false, error: 'Failed to fetch events.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<EventWithRelations>> {
    try {
      const event = await prisma.event.findUnique({
        where: { slug },
        include: {
          category: true,
          destination: true,
          country: true,
          city: true,
          schedules: { orderBy: { sortOrder: 'asc' } },
          itineraries: { orderBy: { day: 'asc' } },
          accommodations: { orderBy: { sortOrder: 'asc' } },
          meals: { orderBy: { sortOrder: 'asc' } },
          gallery: { orderBy: { sortOrder: 'asc' } },
          faqs: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!event) return { success: false, error: 'Event not found.' };

      // Increment view count
      await prisma.event.update({
        where: { id: event.id },
        data: { viewCount: { increment: 1 } },
      });

      return { success: true, data: event };
    } catch (err) {
      console.error('[EventService] getBySlug error:', err);
      return { success: false, error: 'Failed to fetch event.' };
    }
  },

  async getById(id: string): Promise<ServiceResult<EventWithRelations>> {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          category: true,
          destination: true,
          country: true,
          city: true,
          schedules: { orderBy: { sortOrder: 'asc' } },
          itineraries: { orderBy: { day: 'asc' } },
          accommodations: { orderBy: { sortOrder: 'asc' } },
          meals: { orderBy: { sortOrder: 'asc' } },
          gallery: { orderBy: { sortOrder: 'asc' } },
          faqs: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!event) return { success: false, error: 'Event not found.' };
      return { success: true, data: event };
    } catch (err) {
      console.error('[EventService] getById error:', err);
      return { success: false, error: 'Failed to fetch event.' };
    }
  },

  async create(input: CreateEventInput): Promise<ServiceResult<Event>> {
    try {
      const existing = await prisma.event.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'An event with this slug already exists.' };

      const event = await prisma.event.create({ data: input });
      return { success: true, data: event };
    } catch (err) {
      console.error('[EventService] create error:', err);
      return { success: false, error: 'Failed to create event.' };
    }
  },

  async update(id: string, input: Partial<CreateEventInput>): Promise<ServiceResult<Event>> {
    try {
      const event = await prisma.event.update({ where: { id }, data: input });
      return { success: true, data: event };
    } catch (err) {
      console.error('[EventService] update error:', err);
      return { success: false, error: 'Failed to update event.' };
    }
  },

  async updateStatus(id: string, status: EventStatus): Promise<ServiceResult<Event>> {
    try {
      const event = await prisma.event.update({ where: { id }, data: { status } });
      return { success: true, data: event };
    } catch (err) {
      console.error('[EventService] updateStatus error:', err);
      return { success: false, error: 'Failed to update event status.' };
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.event.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      console.error('[EventService] delete error:', err);
      return { success: false, error: 'Failed to delete event.' };
    }
  },

  async checkSeatAvailability(
    eventId: string,
    requestedSeats: number,
  ): Promise<ServiceResult<{ available: boolean; remainingSeats: number | null }>> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { availableSeats: true, maximumCapacity: true, currentBookings: true },
      });

      if (!event) return { success: false, error: 'Event not found.' };

      const capacity = event.availableSeats ?? event.maximumCapacity;
      if (!capacity) {
        return { success: true, data: { available: true, remainingSeats: null } };
      }

      const remaining = capacity - event.currentBookings;
      return {
        success: true,
        data: {
          available: remaining >= requestedSeats,
          remainingSeats: remaining,
        },
      };
    } catch (err) {
      console.error('[EventService] checkSeatAvailability error:', err);
      return { success: false, error: 'Failed to check seat availability.' };
    }
  },

  async getFeatured(limit = 6): Promise<ServiceResult<Event[]>> {
    try {
      const events = await prisma.event.findMany({
        where: { isFeatured: true, isActive: true, status: 'PUBLISHED' },
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          country: { select: { id: true, name: true, code: true } },
        },
      });
      return { success: true, data: events };
    } catch (err) {
      console.error('[EventService] getFeatured error:', err);
      return { success: false, error: 'Failed to fetch featured events.' };
    }
  },
};
