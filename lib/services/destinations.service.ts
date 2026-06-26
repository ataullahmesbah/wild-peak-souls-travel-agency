import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
import type { Destination, Country, City, Prisma } from '@prisma/client';

// ─── Destinations Service ─────────────────────────────────────────

export interface CreateDestinationInput {
  title: string;
  slug: string;
  countryId?: string;
  cityId?: string;
  shortDescription?: string;
  description?: string;
  coverUrl?: string;
  galleryUrls?: string[];
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  altitude?: string;
  bestSeason?: string;
  climate?: string;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export const destinationsService = {
  async list(
    params: QueryParams & { countryId?: string; isFeatured?: boolean } = {},
  ): Promise<ServiceResult<PaginatedResponse<Destination>>> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        sort = 'sortOrder',
        order = 'asc',
        countryId,
        isFeatured,
      } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.DestinationWhereInput = {
        isActive: true,
        ...(countryId && { countryId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, data] = await Promise.all([
        prisma.destination.count({ where }),
        prisma.destination.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            country: { select: { id: true, name: true, code: true } },
            city: { select: { id: true, name: true } },
            _count: { select: { tours: true, events: true } },
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
      console.error('[DestinationsService] list error:', err);
      return { success: false, error: 'Failed to fetch destinations.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<Destination>> {
    try {
      const destination = await prisma.destination.findUnique({
        where: { slug },
        include: {
          country: true,
          city: true,
          tours: {
            where: { status: 'PUBLISHED', isActive: true },
            take: 6,
            orderBy: { sortOrder: 'asc' },
          },
          events: {
            where: { status: 'PUBLISHED', isActive: true },
            take: 6,
            orderBy: { startDate: 'asc' },
          },
        },
      });

      if (!destination) return { success: false, error: 'Destination not found.' };

      await prisma.destination.update({
        where: { id: destination.id },
        data: { viewCount: { increment: 1 } },
      });

      return { success: true, data: destination };
    } catch (err) {
      console.error('[DestinationsService] getBySlug error:', err);
      return { success: false, error: 'Failed to fetch destination.' };
    }
  },

  async getFeatured(limit = 6): Promise<ServiceResult<Destination[]>> {
    try {
      const destinations = await prisma.destination.findMany({
        where: { isFeatured: true, isActive: true },
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          country: { select: { id: true, name: true, code: true } },
          _count: { select: { tours: true, events: true } },
        },
      });
      return { success: true, data: destinations };
    } catch (err) {
      console.error('[DestinationsService] getFeatured error:', err);
      return { success: false, error: 'Failed to fetch featured destinations.' };
    }
  },

  async create(input: CreateDestinationInput): Promise<ServiceResult<Destination>> {
    try {
      const existing = await prisma.destination.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'A destination with this slug already exists.' };
      const destination = await prisma.destination.create({ data: input });
      return { success: true, data: destination };
    } catch (err) {
      console.error('[DestinationsService] create error:', err);
      return { success: false, error: 'Failed to create destination.' };
    }
  },

  async update(id: string, input: Partial<CreateDestinationInput>): Promise<ServiceResult<Destination>> {
    try {
      const destination = await prisma.destination.update({ where: { id }, data: input });
      return { success: true, data: destination };
    } catch (err) {
      console.error('[DestinationsService] update error:', err);
      return { success: false, error: 'Failed to update destination.' };
    }
  },
};

// ─── Countries Service ────────────────────────────────────────────

export const countriesService = {
  async list(): Promise<ServiceResult<Country[]>> {
    try {
      const countries = await prisma.country.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: { _count: { select: { destinations: true, events: true } } },
      });
      return { success: true, data: countries };
    } catch (err) {
      return { success: false, error: 'Failed to fetch countries.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<Country>> {
    try {
      const country = await prisma.country.findUnique({
        where: { slug },
        include: {
          cities: { where: { isActive: true }, orderBy: { name: 'asc' } },
          destinations: { where: { isActive: true }, take: 12 },
        },
      });
      if (!country) return { success: false, error: 'Country not found.' };
      return { success: true, data: country };
    } catch (err) {
      return { success: false, error: 'Failed to fetch country.' };
    }
  },
};

// ─── Cities Service ───────────────────────────────────────────────

export const citiesService = {
  async listByCountry(countryId: string): Promise<ServiceResult<City[]>> {
    try {
      const cities = await prisma.city.findMany({
        where: { countryId, isActive: true },
        orderBy: { name: 'asc' },
      });
      return { success: true, data: cities };
    } catch (err) {
      return { success: false, error: 'Failed to fetch cities.' };
    }
  },
};
