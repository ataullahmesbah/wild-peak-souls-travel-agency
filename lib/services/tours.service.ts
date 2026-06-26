import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
import type { Tour, TourStatus, Prisma } from '@prisma/client';

export interface CreateTourInput {
  title: string;
  slug: string;
  categoryId?: string;
  destinationId?: string;
  countryId?: string;
  cityId?: string;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  includedItems?: string[];
  excludedItems?: string[];
  coverUrl?: string;
  galleryUrls?: string[];
  duration?: string;
  durationDays?: number;
  durationNights?: number;
  difficulty?: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'DIFFICULT' | 'EXTREME';
  maxGroupSize?: number;
  minGroupSize?: number;
  startingPrice?: number;
  isFeatured?: boolean;
  termsConditions?: string;
  cancellationPolicy?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export interface TourListParams extends QueryParams {
  status?: TourStatus;
  categoryId?: string;
  destinationId?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export const toursService = {
  async list(
    params: TourListParams = {},
  ): Promise<ServiceResult<PaginatedResponse<Tour>>> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        sort = 'sortOrder',
        order = 'asc',
        status,
        categoryId,
        destinationId,
        difficulty,
        minPrice,
        maxPrice,
        isFeatured,
      } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.TourWhereInput = {
        ...(status ? { status } : { status: 'PUBLISHED' }),
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(destinationId && { destinationId }),
        ...(difficulty && { difficulty: difficulty as Prisma.EnumTourDifficultyFilter }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              startingPrice: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
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
        prisma.tour.count({ where }),
        prisma.tour.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            destination: { select: { id: true, title: true, slug: true } },
            country: { select: { id: true, name: true, code: true } },
            _count: { select: { bookings: true, reviews: true } },
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
      console.error('[ToursService] list error:', err);
      return { success: false, error: 'Failed to fetch tours.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<Tour>> {
    try {
      const tour = await prisma.tour.findUnique({
        where: { slug },
        include: {
          category: true,
          destination: true,
          country: true,
          city: true,
          faqs: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          reviews: {
            where: { status: 'PUBLISHED' },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      });

      if (!tour) return { success: false, error: 'Tour not found.' };

      await prisma.tour.update({
        where: { id: tour.id },
        data: { viewCount: { increment: 1 } },
      });

      return { success: true, data: tour };
    } catch (err) {
      console.error('[ToursService] getBySlug error:', err);
      return { success: false, error: 'Failed to fetch tour.' };
    }
  },

  async getFeatured(limit = 6): Promise<ServiceResult<Tour[]>> {
    try {
      const tours = await prisma.tour.findMany({
        where: { isFeatured: true, status: 'PUBLISHED', isActive: true },
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          country: { select: { id: true, name: true, code: true } },
        },
      });
      return { success: true, data: tours };
    } catch (err) {
      console.error('[ToursService] getFeatured error:', err);
      return { success: false, error: 'Failed to fetch featured tours.' };
    }
  },

  async create(input: CreateTourInput): Promise<ServiceResult<Tour>> {
    try {
      const existing = await prisma.tour.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'A tour with this slug already exists.' };
      const tour = await prisma.tour.create({ data: input });
      return { success: true, data: tour };
    } catch (err) {
      console.error('[ToursService] create error:', err);
      return { success: false, error: 'Failed to create tour.' };
    }
  },

  async update(id: string, input: Partial<CreateTourInput>): Promise<ServiceResult<Tour>> {
    try {
      const tour = await prisma.tour.update({ where: { id }, data: input });
      return { success: true, data: tour };
    } catch (err) {
      console.error('[ToursService] update error:', err);
      return { success: false, error: 'Failed to update tour.' };
    }
  },

  async updateStatus(id: string, status: TourStatus): Promise<ServiceResult<Tour>> {
    try {
      const tour = await prisma.tour.update({ where: { id }, data: { status } });
      return { success: true, data: tour };
    } catch (err) {
      console.error('[ToursService] updateStatus error:', err);
      return { success: false, error: 'Failed to update tour status.' };
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.tour.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      console.error('[ToursService] delete error:', err);
      return { success: false, error: 'Failed to delete tour.' };
    }
  },
};
