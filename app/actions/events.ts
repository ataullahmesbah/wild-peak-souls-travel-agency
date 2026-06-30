"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { eventService } from "@/lib/services/events.service";

export async function getAdminEvents(page = 1, limit = 20, status?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const skip = (page - 1) * limit;
  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        destination: { select: { title: true } },
        country: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    }),
  ]);

  return { success: true, data: { events, total, page, limit } };
}

export async function getEventById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      destination: true,
      country: true,
      city: true,
      schedules: true,
      itineraries: true,
      accommodations: true,
      meals: true,
      gallery: true,
      faqs: true,
    },
  });
  if (!event) return { success: false, error: "Event not found" };
  return { success: true, data: event };
}

export async function createEvent(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await eventService.create(data);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return result;
}

export async function updateEvent(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await eventService.update(id, data);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return result;
}

export async function updateEventStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await eventService.updateStatus(id, status as any);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return result;
}

export async function deleteEvent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  const result = await eventService.delete(id);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return result;
}

export async function bulkDeleteEvents(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.event.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function bulkUpdateEventStatus(ids: string[], status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!["admin", "super_admin"].includes(session.user.role)) return { success: false, error: "Forbidden" };

  await prisma.event.updateMany({ where: { id: { in: ids } }, data: { status: status as any } });
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  return { success: true };
}
