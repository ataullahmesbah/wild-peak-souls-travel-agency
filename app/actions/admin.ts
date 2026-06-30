"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

const ADMIN_ROLES = ["admin", "super_admin"];
const MOD_ROLES = ["admin", "super_admin", "moderator"];

interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
}

async function requireAuth(minRole: "admin" | "moderator" = "admin"): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const roles = minRole === "moderator" ? MOD_ROLES : ADMIN_ROLES;
  if (!roles.includes(session.user.role)) return { success: false, error: "Forbidden" };
  return { success: true, userId: session.user.id };
}

const MODEL_MAP: Record<string, any> = {
  tours: prisma.tour,
  events: prisma.event,
  destinations: prisma.destination,
  countries: prisma.country,
  cities: prisma.city,
  "tour-categories": prisma.tourCategory,
  "event-categories": prisma.eventCategory,
  "blog-categories": prisma.blogCategory,
  blogs: prisma.blog,
  faqs: prisma.fAQ,
  "hot-deals": prisma.hotDeal,
  "special-offers": prisma.specialOffer,
  "homepage-sections": prisma.homepageSection,
  "cms-pages": prisma.cMSPage,
  "site-settings": prisma.siteSettings,
  coupons: prisma.coupon,
  reviews: prisma.review,
  bookings: prisma.booking,
  users: prisma.user,
  notifications: prisma.notification,
  gallery: prisma.gallery,
  "media-library": prisma.mediaLibrary,
};

const LIST_INCLUDES: Record<string, any> = {
  tours: {
    category: { select: { name: true } },
    destination: { select: { title: true } },
    country: { select: { name: true } },
    _count: { select: { reviews: true, bookings: true } },
  },
  events: {
    category: { select: { name: true } },
    destination: { select: { title: true } },
    country: { select: { name: true } },
    _count: { select: { bookings: true } },
  },
  destinations: {
    country: { select: { name: true } },
    city: { select: { name: true } },
    _count: { select: { tours: true, events: true } },
  },
  blogs: {
    category: { select: { name: true } },
    _count: { select: { reviews: true } },
  },
  countries: {
    _count: { select: { cities: true, destinations: true } },
  },
  cities: {
    country: { select: { name: true } },
  },
  "tour-categories": {
    _count: { select: { tours: true } },
  },
  "event-categories": {
    _count: { select: { events: true } },
  },
  "blog-categories": {
    _count: { select: { blogs: true } },
  },
  bookings: {
    user: { select: { name: true, email: true } },
    event: { select: { title: true } },
    tour: { select: { title: true } },
  },
  users: {
    profile: { select: { firstName: true, lastName: true } },
  },
  reviews: {
    user: { select: { name: true } },
    tour: { select: { title: true } },
    event: { select: { title: true } },
  },
};

const SEARCH_FIELDS: Record<string, string[]> = {
  tours: ["title", "slug", "description", "shortDescription"],
  events: ["title", "slug", "overview", "shortDescription"],
  destinations: ["title", "slug", "description", "shortDescription", "bestSeason", "climate"],
  blogs: ["title", "slug", "excerpt"],
  countries: ["name", "slug"],
  cities: ["name", "slug"],
  "tour-categories": ["name", "slug"],
  "event-categories": ["name", "slug"],
  "blog-categories": ["name", "slug"],
  faqs: ["question", "answer"],
  "hot-deals": ["title", "slug"],
  "special-offers": ["title", "slug"],
  coupons: ["code", "description"],
  bookings: ["bookingRef", "status"],
  users: ["name", "email"],
  reviews: ["title", "content"],
};

const STATUS_FIELDS: Record<string, string> = {
  tours: "status",
  events: "status",
  blogs: "status",
  bookings: "status",
  destinations: "isActive",
  countries: "isActive",
  cities: "isActive",
  "hot-deals": "isEnabled",
  "special-offers": "isEnabled",
  coupons: "isActive",
  users: "status",
  reviews: "isVerified",
  "homepage-sections": "isEnabled",
  "cms-pages": "isPublished",
};

export async function adminList(model: string, page = 1, limit = 20, search?: string, status?: string) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  const where: any = {};
  if (status && STATUS_FIELDS[model]) {
    const field = STATUS_FIELDS[model];
    if (typeof where[field] === "boolean") {
      where[field] = status === "ACTIVE" || status === "PUBLISHED" || status === "true";
    } else {
      where[field] = status;
    }
  }
  if (search) {
    const fields = SEARCH_FIELDS[model] || ["title", "name"];
    where.OR = fields.map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  }

  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    delegate.count({ where }),
    delegate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: LIST_INCLUDES[model] || {},
    }),
  ]);

  return { success: true, data: { items: data, total, page, limit } };
}

export async function adminGetById(model: string, id: string) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  const item = await delegate.findUnique({
    where: { id },
    include: LIST_INCLUDES[model] || {},
  });
  if (!item) return { success: false, error: "Not found" };
  return { success: true, data: item };
}

export async function adminCreate(model: string, data: any) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  const clean = { ...data };
  delete clean.id;
  delete clean.createdAt;
  delete clean.updatedAt;

  const dateFields = ["startsAt", "endsAt", "startDate", "endDate", "publishedAt", "travelDate", "returnDate", "expiresAt"];
  for (const field of dateFields) {
    if (clean[field] && typeof clean[field] === "string") {
      clean[field] = new Date(clean[field]);
    }
  }

  try {
    const item = await delegate.create({ data: clean });
    revalidatePath(`/dashboard/admin/${model}`);
    return { success: true, data: item };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create" };
  }
}

export async function adminUpdate(model: string, id: string, data: any) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  const clean = { ...data };
  delete clean.id;
  delete clean.createdAt;
  delete clean.updatedAt;

  const dateFields = ["startsAt", "endsAt", "startDate", "endDate", "publishedAt", "travelDate", "returnDate", "expiresAt"];
  for (const field of dateFields) {
    if (clean[field] && typeof clean[field] === "string") {
      clean[field] = new Date(clean[field]);
    }
  }

  try {
    const item = await delegate.update({ where: { id }, data: clean });
    revalidatePath(`/dashboard/admin/${model}`);
    return { success: true, data: item };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update" };
  }
}

export async function adminDelete(model: string, id: string) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  try {
    await delegate.delete({ where: { id } });
    revalidatePath(`/dashboard/admin/${model}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete" };
  }
}

export async function adminBulkDelete(model: string, ids: string[]) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  try {
    await delegate.deleteMany({ where: { id: { in: ids } } });
    revalidatePath(`/dashboard/admin/${model}`);
    return { success: true, deleted: ids.length };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to bulk delete" };
  }
}

export async function adminBulkUpdate(model: string, ids: string[], data: any) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  try {
    const result = await delegate.updateMany({ where: { id: { in: ids } }, data });
    revalidatePath(`/dashboard/admin/${model}`);
    return { success: true, count: result.count };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to bulk update" };
  }
}

export async function adminToggleField(model: string, id: string, field: string) {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const delegate = MODEL_MAP[model];
  if (!delegate) return { success: false, error: "Unknown model" };

  const existing = await delegate.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Not found" };

  const current = (existing as any)[field];
  const updated = await delegate.update({
    where: { id },
    data: { [field]: !current },
  });
  revalidatePath(`/dashboard/admin/${model}`);
  return { success: true, data: updated };
}

export async function adminStats() {
  const auth = await requireAuth();
  if (!auth.success) return { success: false, error: auth.error || "Unauthorized" };

  const stats = await Promise.all([
    prisma.tour.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.destination.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
  ]);

  return {
    success: true,
    data: {
      tours: stats[0],
      events: stats[1],
      destinations: stats[2],
      bookings: stats[3],
      customers: stats[4],
      blogs: stats[5],
    },
  };
}
