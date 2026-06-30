"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { destinationsService } from "@/lib/services/destinations.service";

export async function getAdminDestinations(page = 1, limit = 20, status?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const where: any = {};
  if (status) where.isActive = status === "ACTIVE";

  const skip = (page - 1) * limit;
  const [total, destinations] = await Promise.all([
    prisma.destination.count({ where }),
    prisma.destination.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        country: { select: { name: true } },
        city: { select: { name: true } },
        _count: { select: { tours: true, events: true } },
      },
    }),
  ]);

  return { success: true, data: { destinations, total, page, limit } };
}

export async function createDestination(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await destinationsService.create(data);
  revalidatePath("/dashboard/admin/destinations");
  revalidatePath("/destinations");
  return result;
}

export async function updateDestination(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await destinationsService.update(id, data);
  revalidatePath("/dashboard/admin/destinations");
  revalidatePath("/destinations");
  return result;
}

export async function deleteDestination(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.destination.delete({ where: { id } });
  revalidatePath("/dashboard/admin/destinations");
  revalidatePath("/destinations");
  return { success: true };
}

export async function bulkDeleteDestinations(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.destination.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/dashboard/admin/destinations");
  revalidatePath("/destinations");
  return { success: true };
}
