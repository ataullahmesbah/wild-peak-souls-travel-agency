import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

const MODEL_MAP: Record<string, string> = {
  tours: "tour",
  events: "event",
  destinations: "destination",
  countries: "country",
  cities: "city",
  "tour-categories": "tourCategory",
  "event-categories": "eventCategory",
  "blog-categories": "blogCategory",
  blogs: "blog",
  faqs: "faq",
  "hot-deals": "hotDeal",
  "special-offers": "specialOffer",
  "homepage-sections": "homepageSection",
  "cms-pages": "cMSPage",
  "site-settings": "siteSetting",
  coupons: "coupon",
  reviews: "review",
  bookings: "booking",
  users: "user",
  notifications: "notification",
  gallery: "gallery",
  "media-library": "mediaLibrary",
};

const ADMIN_MODELS = [
  "tour", "event", "destination", "country", "city",
  "tourCategory", "eventCategory", "blogCategory",
  "blog", "faq", "hotDeal", "specialOffer", "homepageSection",
  "cMSPage", "siteSetting", "coupon", "review", "booking",
  "user", "notification", "gallery", "mediaLibrary",
];

function getModel(urlModel: string): string | null {
  const mapped = MODEL_MAP[urlModel];
  if (mapped) return mapped;
  // Try direct match
  const capitalized = urlModel.charAt(0).toUpperCase() + urlModel.slice(1);
  const camelCase = urlModel.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  if (ADMIN_MODELS.includes(camelCase)) return camelCase;
  if (ADMIN_MODELS.includes(capitalized)) return capitalized;
  return null;
}

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = session.user.role;
  if (!["admin", "super_admin", "moderator"].includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, role };
}

export async function GET(req: NextRequest, { params }: { params: { model: string } }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const model = getModel(params.model);
  if (!model) return NextResponse.json({ error: "Unknown model" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";
  const id = searchParams.get("id");

  const delegate = (prisma as any)[model];
  if (!delegate) return NextResponse.json({ error: "Model not found" }, { status: 400 });

  try {
    if (id) {
      const item = await delegate.findUnique({
        where: { id },
        include: getIncludes(model),
      });
      return NextResponse.json({ success: true, data: item });
    }

    const where: any = {};
    if (status && model !== "siteSetting" && model !== "mediaLibrary") {
      where.status = status;
    }
    if (search) {
      const searchFields = getSearchFields(model);
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      }));
    }

    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: getListIncludes(model),
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { model: string } }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const model = getModel(params.model);
  if (!model) return NextResponse.json({ error: "Unknown model" }, { status: 400 });

  const delegate = (prisma as any)[model];
  if (!delegate) return NextResponse.json({ error: "Model not found" }, { status: 400 });

  try {
    const body = await req.json();
    const data = cleanCreateData(model, body);
    const item = await delegate.create({ data });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { model: string } }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const model = getModel(params.model);
  if (!model) return NextResponse.json({ error: "Unknown model" }, { status: 400 });

  const delegate = (prisma as any)[model];
  if (!delegate) return NextResponse.json({ error: "Model not found" }, { status: 400 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await req.json();
    const data = cleanUpdateData(model, body);
    const item = await delegate.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { model: string } }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const model = getModel(params.model);
  if (!model) return NextResponse.json({ error: "Unknown model" }, { status: 400 });

  const delegate = (prisma as any)[model];
  if (!delegate) return NextResponse.json({ error: "Model not found" }, { status: 400 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (ids) {
      const idArray = ids.split(",");
      await delegate.deleteMany({ where: { id: { in: idArray } } });
      return NextResponse.json({ success: true, deleted: idArray.length });
    }

    if (!id) return NextResponse.json({ error: "ID or ids required" }, { status: 400 });

    await delegate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function getIncludes(model: string) {
  const includes: Record<string, any> = {
    tour: { category: true, destination: true, country: true, faqs: true, reviews: true },
    event: { category: true, destination: true, country: true, schedules: true, itineraries: true, accommodations: true, meals: true, gallery: true, faqs: true },
    destination: { country: true, city: true, tours: true, events: true },
    blog: { category: true },
    booking: { user: true, event: true, tour: true, participants: true, payments: true },
    user: { profile: true },
    review: { user: true, tour: true, event: true },
    hotDeal: {},
    specialOffer: {},
    homepageSection: {},
    cMSPage: {},
    siteSetting: {},
    coupon: {},
    faq: {},
    gallery: {},
    mediaLibrary: {},
    country: {},
    city: {},
    tourCategory: {},
    eventCategory: {},
    blogCategory: {},
    notification: {},
  };
  return includes[model] || {};
}

function getListIncludes(model: string) {
  const includes: Record<string, any> = {
    tour: { category: { select: { name: true } }, destination: { select: { title: true } }, country: { select: { name: true } }, _count: { select: { reviews: true, bookings: true } } },
    event: { category: { select: { name: true } }, destination: { select: { title: true } }, country: { select: { name: true } }, _count: { select: { bookings: true } } },
    destination: { country: { select: { name: true } }, _count: { select: { tours: true, events: true } } },
    blog: { category: { select: { name: true } } },
    booking: { user: { select: { name: true, email: true } }, event: { select: { title: true } }, tour: { select: { title: true } } },
    user: { profile: { select: { firstName: true, lastName: true } } },
    review: { user: { select: { name: true } }, tour: { select: { title: true } }, event: { select: { title: true } } },
    country: { _count: { select: { cities: true, destinations: true } } },
    city: { country: { select: { name: true } } },
    hotDeal: {},
    specialOffer: {},
    homepageSection: {},
    cMSPage: {},
    siteSetting: {},
    coupon: {},
    faq: {},
    gallery: {},
    mediaLibrary: {},
    tourCategory: { _count: { select: { tours: true } } },
    eventCategory: { _count: { select: { events: true } } },
    blogCategory: { _count: { select: { blogs: true } } },
    notification: {},
  };
  return includes[model] || {};
}

function getSearchFields(model: string): string[] {
  const fields: Record<string, string[]> = {
    tour: ["title", "slug", "description", "shortDescription"],
    event: ["title", "slug", "overview", "shortDescription"],
    destination: ["title", "slug", "description", "shortDescription", "bestSeason", "climate"],
    blog: ["title", "slug", "excerpt", "content"],
    booking: ["bookingRef", "status"],
    user: ["name", "email"],
    review: ["title", "content"],
    country: ["name", "slug", "description"],
    city: ["name", "slug"],
    hotDeal: ["title", "slug", "description"],
    specialOffer: ["title", "slug", "description"],
    coupon: ["code", "description"],
    faq: ["question", "answer"],
    gallery: ["title"],
    mediaLibrary: ["title", "altText"],
    tourCategory: ["name", "slug"],
    eventCategory: ["name", "slug"],
    blogCategory: ["name", "slug"],
    homepageSection: ["sectionType"],
    cMSPage: ["title", "slug"],
    siteSetting: ["key", "value"],
    notification: ["title", "message"],
  };
  return fields[model] || ["title", "name"];
}

function cleanCreateData(model: string, body: any) {
  const result = { ...body };
  delete result.id;
  delete result.createdAt;
  delete result.updatedAt;
  if (result.startsAt && typeof result.startsAt === "string") result.startsAt = new Date(result.startsAt);
  if (result.endsAt && typeof result.endsAt === "string") result.endsAt = new Date(result.endsAt);
  if (result.startDate && typeof result.startDate === "string") result.startDate = new Date(result.startDate);
  if (result.endDate && typeof result.endDate === "string") result.endDate = new Date(result.endDate);
  if (result.publishedAt && typeof result.publishedAt === "string") result.publishedAt = new Date(result.publishedAt);
  if (result.travelDate && typeof result.travelDate === "string") result.travelDate = new Date(result.travelDate);
  if (result.returnDate && typeof result.returnDate === "string") result.returnDate = new Date(result.returnDate);
  if (result.expiresAt && typeof result.expiresAt === "string") result.expiresAt = new Date(result.expiresAt);
  return result;
}

function cleanUpdateData(model: string, body: any) {
  const result = { ...body };
  delete result.id;
  delete result.createdAt;
  delete result.updatedAt;
  if (result.startsAt && typeof result.startsAt === "string") result.startsAt = new Date(result.startsAt);
  if (result.endsAt && typeof result.endsAt === "string") result.endsAt = new Date(result.endsAt);
  if (result.startDate && typeof result.startDate === "string") result.startDate = new Date(result.startDate);
  if (result.endDate && typeof result.endDate === "string") result.endDate = new Date(result.endDate);
  if (result.publishedAt && typeof result.publishedAt === "string") result.publishedAt = new Date(result.publishedAt);
  if (result.travelDate && typeof result.travelDate === "string") result.travelDate = new Date(result.travelDate);
  if (result.returnDate && typeof result.returnDate === "string") result.returnDate = new Date(result.returnDate);
  if (result.expiresAt && typeof result.expiresAt === "string") result.expiresAt = new Date(result.expiresAt);
  return result;
}
