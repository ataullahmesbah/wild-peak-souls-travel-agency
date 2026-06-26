import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse } from '@/lib/services/types';
import type { HotDeal, SpecialOffer, HomepageSection, Prisma } from '@prisma/client';

// ─── Hot Deals Service ────────────────────────────────────────────

export interface CreateHotDealInput {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  dealType?: 'HOT_DEAL' | 'SPECIAL_OFFER' | 'FLASH_SALE' | 'SEASONAL' | 'EARLY_BIRD';
  eventId?: string;
  tourId?: string;
  externalUrl?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  currency?: string;
  ctaText?: string;
  ctaUrl?: string;
  startsAt?: Date;
  endsAt?: Date;
  isEnabled?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export const hotDealService = {
  async list(params: {
    enabledOnly?: boolean;
    featuredOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ServiceResult<PaginatedResponse<HotDeal>>> {
    try {
      const { enabledOnly = false, featuredOnly = false, page = 1, limit = 12 } = params;
      const skip = (page - 1) * limit;
      const now = new Date();

      const where: Prisma.HotDealWhereInput = {
        ...(enabledOnly && { isEnabled: true }),
        ...(featuredOnly && { isFeatured: true }),
        ...(enabledOnly && {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
        }),
      };

      const [total, data] = await Promise.all([
        prisma.hotDeal.count({ where }),
        prisma.hotDeal.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
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
      console.error('[HotDealService] list error:', err);
      return { success: false, error: 'Failed to fetch hot deals.' };
    }
  },

  async getActive(): Promise<ServiceResult<HotDeal[]>> {
    try {
      const now = new Date();
      const deals = await prisma.hotDeal.findMany({
        where: {
          isEnabled: true,
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
        },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      });
      return { success: true, data: deals };
    } catch (err) {
      console.error('[HotDealService] getActive error:', err);
      return { success: false, error: 'Failed to fetch active hot deals.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<HotDeal>> {
    try {
      const deal = await prisma.hotDeal.findUnique({ where: { slug } });
      if (!deal) return { success: false, error: 'Hot deal not found.' };
      return { success: true, data: deal };
    } catch (err) {
      return { success: false, error: 'Failed to fetch hot deal.' };
    }
  },

  async create(input: CreateHotDealInput): Promise<ServiceResult<HotDeal>> {
    try {
      const existing = await prisma.hotDeal.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'A hot deal with this slug already exists.' };
      const deal = await prisma.hotDeal.create({ data: input });
      return { success: true, data: deal };
    } catch (err) {
      console.error('[HotDealService] create error:', err);
      return { success: false, error: 'Failed to create hot deal.' };
    }
  },

  async update(id: string, input: Partial<CreateHotDealInput>): Promise<ServiceResult<HotDeal>> {
    try {
      const deal = await prisma.hotDeal.update({ where: { id }, data: input });
      return { success: true, data: deal };
    } catch (err) {
      console.error('[HotDealService] update error:', err);
      return { success: false, error: 'Failed to update hot deal.' };
    }
  },

  async toggleEnabled(id: string): Promise<ServiceResult<HotDeal>> {
    try {
      const existing = await prisma.hotDeal.findUniqueOrThrow({ where: { id } });
      const deal = await prisma.hotDeal.update({
        where: { id },
        data: { isEnabled: !existing.isEnabled },
      });
      return { success: true, data: deal };
    } catch (err) {
      console.error('[HotDealService] toggleEnabled error:', err);
      return { success: false, error: 'Failed to toggle hot deal.' };
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.hotDeal.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      console.error('[HotDealService] delete error:', err);
      return { success: false, error: 'Failed to delete hot deal.' };
    }
  },
};

// ─── Special Offers Service ───────────────────────────────────────

export interface CreateSpecialOfferInput {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  coverUrl?: string;
  badgeText?: string;
  eventId?: string;
  tourId?: string;
  externalUrl?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  currency?: string;
  ctaText?: string;
  ctaUrl?: string;
  startsAt?: Date;
  endsAt?: Date;
  isEnabled?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export const specialOfferService = {
  async list(params: {
    enabledOnly?: boolean;
    featuredOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ServiceResult<PaginatedResponse<SpecialOffer>>> {
    try {
      const { enabledOnly = false, featuredOnly = false, page = 1, limit = 12 } = params;
      const skip = (page - 1) * limit;
      const now = new Date();

      const where: Prisma.SpecialOfferWhereInput = {
        ...(enabledOnly && { isEnabled: true }),
        ...(featuredOnly && { isFeatured: true }),
        ...(enabledOnly && {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
        }),
      };

      const [total, data] = await Promise.all([
        prisma.specialOffer.count({ where }),
        prisma.specialOffer.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
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
      console.error('[SpecialOfferService] list error:', err);
      return { success: false, error: 'Failed to fetch special offers.' };
    }
  },

  async getActive(): Promise<ServiceResult<SpecialOffer[]>> {
    try {
      const now = new Date();
      const offers = await prisma.specialOffer.findMany({
        where: {
          isEnabled: true,
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
        },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      });
      return { success: true, data: offers };
    } catch (err) {
      console.error('[SpecialOfferService] getActive error:', err);
      return { success: false, error: 'Failed to fetch active special offers.' };
    }
  },

  async create(input: CreateSpecialOfferInput): Promise<ServiceResult<SpecialOffer>> {
    try {
      const existing = await prisma.specialOffer.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'A special offer with this slug already exists.' };
      const offer = await prisma.specialOffer.create({ data: input });
      return { success: true, data: offer };
    } catch (err) {
      console.error('[SpecialOfferService] create error:', err);
      return { success: false, error: 'Failed to create special offer.' };
    }
  },

  async update(id: string, input: Partial<CreateSpecialOfferInput>): Promise<ServiceResult<SpecialOffer>> {
    try {
      const offer = await prisma.specialOffer.update({ where: { id }, data: input });
      return { success: true, data: offer };
    } catch (err) {
      console.error('[SpecialOfferService] update error:', err);
      return { success: false, error: 'Failed to update special offer.' };
    }
  },

  async toggleEnabled(id: string): Promise<ServiceResult<SpecialOffer>> {
    try {
      const existing = await prisma.specialOffer.findUniqueOrThrow({ where: { id } });
      const offer = await prisma.specialOffer.update({
        where: { id },
        data: { isEnabled: !existing.isEnabled },
      });
      return { success: true, data: offer };
    } catch (err) {
      console.error('[SpecialOfferService] toggleEnabled error:', err);
      return { success: false, error: 'Failed to toggle special offer.' };
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.specialOffer.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      console.error('[SpecialOfferService] delete error:', err);
      return { success: false, error: 'Failed to delete special offer.' };
    }
  },
};

// ─── Homepage Section Service ─────────────────────────────────────

export const homepageSectionService = {
  async getAll(): Promise<ServiceResult<HomepageSection[]>> {
    try {
      const sections = await prisma.homepageSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return { success: true, data: sections };
    } catch (err) {
      console.error('[HomepageSectionService] getAll error:', err);
      return { success: false, error: 'Failed to fetch homepage sections.' };
    }
  },

  async getEnabled(): Promise<ServiceResult<HomepageSection[]>> {
    try {
      const sections = await prisma.homepageSection.findMany({
        where: { isEnabled: true },
        orderBy: { sortOrder: 'asc' },
      });
      return { success: true, data: sections };
    } catch (err) {
      console.error('[HomepageSectionService] getEnabled error:', err);
      return { success: false, error: 'Failed to fetch enabled homepage sections.' };
    }
  },

  async upsert(
    sectionType: HomepageSection['sectionType'],
    data: Partial<Omit<HomepageSection, 'id' | 'createdAt' | 'updatedAt' | 'sectionType'>>,
  ): Promise<ServiceResult<HomepageSection>> {
    try {
      const { config, ...rest } = data;
      const safeData = config != null ? { ...rest, config } : rest;

      const section = await prisma.homepageSection.upsert({
        where: { sectionType },
        create: { sectionType, ...safeData },
        update: safeData,
      });
      return { success: true, data: section };
    } catch (err) {
      console.error('[HomepageSectionService] upsert error:', err);
      return { success: false, error: 'Failed to update homepage section.' };
    }
  },

  async toggleEnabled(sectionType: HomepageSection['sectionType']): Promise<ServiceResult<HomepageSection>> {
    try {
      const existing = await prisma.homepageSection.findUnique({ where: { sectionType } });
      if (!existing) return { success: false, error: 'Section not found.' };

      const section = await prisma.homepageSection.update({
        where: { sectionType },
        data: { isEnabled: !existing.isEnabled },
      });
      return { success: true, data: section };
    } catch (err) {
      console.error('[HomepageSectionService] toggleEnabled error:', err);
      return { success: false, error: 'Failed to toggle section.' };
    }
  },
};
