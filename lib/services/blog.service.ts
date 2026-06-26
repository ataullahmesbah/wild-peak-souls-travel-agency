import { prisma } from '@/lib/db';
import type { ServiceResult, PaginatedResponse, QueryParams } from '@/lib/services/types';
import type { Blog, CMSPage, SiteSettings, Prisma } from '@prisma/client';

// ─── Blog Service ─────────────────────────────────────────────────

export interface CreateBlogInput {
  title: string;
  slug: string;
  categoryId?: string;
  authorId?: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
  allowComments?: boolean;
  readTimeMinutes?: number;
  scheduledAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
}

export const blogService = {
  async list(
    params: QueryParams & { categoryId?: string; tag?: string; isFeatured?: boolean } = {},
  ): Promise<ServiceResult<PaginatedResponse<Blog>>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort = 'publishedAt',
        order = 'desc',
        categoryId,
        tag,
        isFeatured,
      } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.BlogWhereInput = {
        status: 'PUBLISHED',
        ...(categoryId && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(tag && { tags: { has: tag } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, data] = await Promise.all([
        prisma.blog.count({ where }),
        prisma.blog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            category: { select: { id: true, name: true, slug: true, color: true } },
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
      console.error('[BlogService] list error:', err);
      return { success: false, error: 'Failed to fetch blogs.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<Blog>> {
    try {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: { category: true },
      });
      if (!blog) return { success: false, error: 'Blog post not found.' };

      await prisma.blog.update({
        where: { id: blog.id },
        data: { viewCount: { increment: 1 } },
      });

      return { success: true, data: blog };
    } catch (err) {
      console.error('[BlogService] getBySlug error:', err);
      return { success: false, error: 'Failed to fetch blog post.' };
    }
  },

  async create(input: CreateBlogInput): Promise<ServiceResult<Blog>> {
    try {
      const existing = await prisma.blog.findUnique({ where: { slug: input.slug } });
      if (existing) return { success: false, error: 'A blog post with this slug already exists.' };
      const blog = await prisma.blog.create({ data: input });
      return { success: true, data: blog };
    } catch (err) {
      console.error('[BlogService] create error:', err);
      return { success: false, error: 'Failed to create blog post.' };
    }
  },

  async update(id: string, input: Partial<CreateBlogInput>): Promise<ServiceResult<Blog>> {
    try {
      const blog = await prisma.blog.update({ where: { id }, data: input });
      return { success: true, data: blog };
    } catch (err) {
      console.error('[BlogService] update error:', err);
      return { success: false, error: 'Failed to update blog post.' };
    }
  },

  async publish(id: string): Promise<ServiceResult<Blog>> {
    try {
      const blog = await prisma.blog.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
      return { success: true, data: blog };
    } catch (err) {
      console.error('[BlogService] publish error:', err);
      return { success: false, error: 'Failed to publish blog post.' };
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.blog.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      console.error('[BlogService] delete error:', err);
      return { success: false, error: 'Failed to delete blog post.' };
    }
  },
};

// ─── CMS Page Service ─────────────────────────────────────────────

export const cmsPageService = {
  async list(): Promise<ServiceResult<CMSPage[]>> {
    try {
      const pages = await prisma.cMSPage.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return { success: true, data: pages };
    } catch (err) {
      return { success: false, error: 'Failed to fetch CMS pages.' };
    }
  },

  async getBySlug(slug: string): Promise<ServiceResult<CMSPage>> {
    try {
      const page = await prisma.cMSPage.findUnique({ where: { slug } });
      if (!page) return { success: false, error: 'Page not found.' };
      return { success: true, data: page };
    } catch (err) {
      return { success: false, error: 'Failed to fetch page.' };
    }
  },

  async upsert(
    slug: string,
    data: Partial<Omit<CMSPage, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResult<CMSPage>> {
    try {
      // Strip null structuredData — Prisma create input doesn't accept null for Json
      const { structuredData, ...rest } = data;
      const safeData = structuredData != null ? { ...rest, structuredData } : rest;

      const page = await prisma.cMSPage.upsert({
        where: { slug },
        create: { slug, title: safeData.title ?? slug, ...safeData },
        update: safeData,
      });
      return { success: true, data: page };
    } catch (err) {
      console.error('[CMSPageService] upsert error:', err);
      return { success: false, error: 'Failed to save CMS page.' };
    }
  },
};

// ─── Site Settings Service ────────────────────────────────────────

export const siteSettingsService = {
  async get(key: string): Promise<ServiceResult<SiteSettings | null>> {
    try {
      const setting = await prisma.siteSettings.findUnique({ where: { key } });
      return { success: true, data: setting };
    } catch (err) {
      return { success: false, error: 'Failed to fetch setting.' };
    }
  },

  async getGroup(group: string): Promise<ServiceResult<SiteSettings[]>> {
    try {
      const settings = await prisma.siteSettings.findMany({ where: { group } });
      return { success: true, data: settings };
    } catch (err) {
      return { success: false, error: 'Failed to fetch settings group.' };
    }
  },

  async getPublic(): Promise<ServiceResult<SiteSettings[]>> {
    try {
      const settings = await prisma.siteSettings.findMany({ where: { isPublic: true } });
      return { success: true, data: settings };
    } catch (err) {
      return { success: false, error: 'Failed to fetch public settings.' };
    }
  },

  async set(
    key: string,
    value: string | null,
    opts: { group?: string; label?: string; isPublic?: boolean; isSuperAdminOnly?: boolean } = {},
  ): Promise<ServiceResult<SiteSettings>> {
    try {
      const setting = await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value, ...opts },
        update: { value },
      });
      return { success: true, data: setting };
    } catch (err) {
      console.error('[SiteSettingsService] set error:', err);
      return { success: false, error: 'Failed to save setting.' };
    }
  },
};
