"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { toursService } from "@/lib/services/tours.service";

export async function getAdminTours(page = 1, limit = 20, status?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const role = session.user.role;
  if (!["admin", "super_admin"].includes(role)) return { success: false, error: "Forbidden" };

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const skip = (page - 1) * limit;
  const [total, tours] = await Promise.all([
    prisma.tour.count({ where }),
    prisma.tour.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        destination: { select: { title: true } },
        country: { select: { name: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
    }),
  ]);

  return { success: true, data: { tours, total, page, limit } };
}

export async function getTourById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      category: true,
      destination: true,
      country: true,
      city: true,
      faqs: true,
      reviews: { include: { user: { select: { name: true, image: true } } } },
    },
  });
  if (!tour) return { success: false, error: "Tour not found" };
  return { success: true, data: tour };
}

export async function createTour(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  try {
    const tour = await toursService.create(data);
    revalidatePath("/dashboard/admin/tours");
    revalidatePath("/tours");
    return tour;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create tour" };
  }
}

export async function updateTour(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  try {
    const tour = await toursService.update(id, data);
    revalidatePath("/dashboard/admin/tours");
    revalidatePath("/tours");
    revalidatePath(`/tours/${data.slug ?? ""}`);
    return tour;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update tour" };
  }
}

export async function updateTourStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await toursService.updateStatus(id, status as any);
  revalidatePath("/dashboard/admin/tours");
  revalidatePath("/tours");
  return result;
}

export async function deleteTour(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await toursService.delete(id);
  revalidatePath("/dashboard/admin/tours");
  revalidatePath("/tours");
  return result;
}

export async function bulkDeleteTours(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.tour.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/dashboard/admin/tours");
  revalidatePath("/tours");
  return { success: true };
}

export async function bulkUpdateTourStatus(ids: string[], status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.tour.updateMany({ where: { id: { in: ids } }, data: { status: status as any } });
  revalidatePath("/dashboard/admin/tours");
  revalidatePath("/tours");
  return { success: true };
}
