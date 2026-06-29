/**
 * Notification Service — Unified Notification System
 *
 * Prepares notifications for booking events, payment updates,
 * tour reminders, and system messages.
 */

import { prisma } from "@/lib/db";
import type { ServiceResult } from "@/lib/services/types";

export type AppNotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_DUE"
  | "PAYMENT_REFUNDED"
  | "TOUR_STARTING"
  | "EVENT_STARTING"
  | "EVENT_UPDATED"
  | "TOUR_UPDATED"
  | "MESSAGE_RECEIVED"
  | "REVIEW_RECEIVED"
  | "WELCOME"
  | "SYSTEM"
  | "PROMOTIONAL";

export type NotificationChannel = "in_app" | "email" | "push" | "sms";

export interface NotificationInput {
  userId: string;
  type: AppNotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: any;
  channels?: NotificationChannel[];
  sendImmediately?: boolean;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  booking: boolean;
  payment: boolean;
  marketing: boolean;
  tourReminders: boolean;
  eventReminders: boolean;
}

export const notificationService = {
  async create(input: NotificationInput): Promise<ServiceResult<NotificationRecord>> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          type: "GENERAL",
          title: input.title,
          message: input.body ?? "",
          linkUrl: input.link,
          metadata: input.metadata as any,
          isRead: false,
        },
      });

      return {
        success: true,
        data: {
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          body: notification.message,
          link: notification.linkUrl ?? undefined,
          isRead: notification.isRead,
          metadata: notification.metadata as any,
          createdAt: notification.createdAt,
          readAt: notification.readAt ?? undefined,
        },
      };
    } catch (err) {
      console.error("[NotificationService] create error:", err);
      return { success: false, error: "Failed to create notification." };
    }
  },

  async getByUserId(
    userId: string,
    options: { unreadOnly?: boolean; page?: number; limit?: number } = {}
  ): Promise<ServiceResult<{ notifications: NotificationRecord[]; unreadCount: number }>> {
    try {
      const where = { userId, ...(options.unreadOnly ? { isRead: false } : {}) };
      const skip = options.limit ? ((options.page ?? 1) - 1) * (options.limit ?? 20) : undefined;
      const take = options.limit;

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      return {
        success: true,
        data: {
          notifications: notifications.map((n) => ({
            id: n.id,
            userId: n.userId,
            type: n.type,
            title: n.title,
            body: n.message,
            link: n.linkUrl ?? undefined,
            isRead: n.isRead,
            metadata: n.metadata as any,
            createdAt: n.createdAt,
            readAt: n.readAt ?? undefined,
          })),
          unreadCount,
        },
      };
    } catch (err) {
      console.error("[NotificationService] getByUserId error:", err);
      return { success: false, error: "Failed to fetch notifications." };
    }
  },

  async markAsRead(notificationId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true, readAt: new Date() },
      });
      return { success: true };
    } catch (err) {
      console.error("[NotificationService] markAsRead error:", err);
      return { success: false, error: "Failed to mark as read." };
    }
  },

  async markAllAsRead(userId: string): Promise<ServiceResult<void>> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return { success: true };
    } catch (err) {
      console.error("[NotificationService] markAllAsRead error:", err);
      return { success: false, error: "Failed to mark all as read." };
    }
  },

  async deleteNotification(notificationId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      await prisma.notification.deleteMany({
        where: { id: notificationId, userId },
      });
      return { success: true };
    } catch (err) {
      console.error("[NotificationService] deleteNotification error:", err);
      return { success: false, error: "Failed to delete notification." };
    }
  },

  async bookingConfirmed(userId: string, bookingRef: string, itemName: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "BOOKING_CONFIRMED",
      title: "Booking Confirmed",
      body: `Your booking ${bookingRef} for ${itemName} has been confirmed.`,
      link: `/dashboard/bookings/${bookingRef}`,
      channels: ["in_app", "email"],
    });
  },

  async bookingCancelled(userId: string, bookingRef: string, itemName: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      body: `Your booking ${bookingRef} for ${itemName} has been cancelled.`,
      link: `/dashboard/bookings/${bookingRef}`,
      channels: ["in_app", "email"],
    });
  },

  async paymentReceived(userId: string, bookingRef: string, amount: number, currency: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "PAYMENT_RECEIVED",
      title: "Payment Received",
      body: `Payment of ${amount} ${currency} received for booking ${bookingRef}.`,
      link: `/dashboard/bookings/${bookingRef}`,
      channels: ["in_app", "email"],
    });
  },

  async paymentFailed(userId: string, bookingRef: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "PAYMENT_DUE",
      title: "Payment Failed",
      body: `Payment for booking ${bookingRef} failed. Please retry payment.`,
      link: `/dashboard/bookings/${bookingRef}`,
      channels: ["in_app", "email"],
    });
  },

  async tourReminder(userId: string, tourName: string, startDate: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "TOUR_STARTING",
      title: "Tour Starting Soon",
      body: `Your tour ${tourName} starts on ${startDate}.`,
      link: `/dashboard/bookings`,
      channels: ["in_app", "email"],
    });
  },

  async welcome(userId: string, name: string): Promise<ServiceResult<NotificationRecord>> {
    return this.create({
      userId,
      type: "WELCOME",
      title: "Welcome to Wild Peak Souls",
      body: `Hi ${name}, welcome to your adventure dashboard! Start exploring tours and events.`,
      link: `/destinations`,
      channels: ["in_app", "email"],
    });
  },
};
