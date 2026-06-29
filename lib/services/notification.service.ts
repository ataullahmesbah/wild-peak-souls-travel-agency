/**
 * Notification Service — Unified Notification System
 *
 * Prepares notifications for booking events, payment updates,
 * tour reminders, and system messages. Notifications are
 * stored in the database and can be delivered via:
 * - In-app notifications (WebSocket / Server-Sent Events)
 * - Email (via email service)
 * - Push notifications (future)
 *
 * This is a preparation layer. Actual delivery channels will be
 * wired when WebSocket infrastructure is configured.
 */

import { prisma } from "@/lib/db";
import type { ServiceResult } from "@/lib/services/types";

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
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
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
          type: input.type,
          title: input.title,
          body: input.body,
          link: input.link,
          metadata: input.metadata ?? {},
          isRead: false,
        },
      });

      // TODO: Send to email channel if configured
      // TODO: Send to push channel if configured
      // TODO: Send to in-app via WebSocket / SSE

      return { success: true, data: notification as NotificationRecord };
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
          notifications: notifications as NotificationRecord[],
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

  // ── Pre-built notification templates ───────────────────────────

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
      type: "PAYMENT_FAILED",
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
