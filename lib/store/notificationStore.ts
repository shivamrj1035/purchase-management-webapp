import { create } from "zustand";
import {
  Notification,
  NotificationConfig,
  NotificationTrigger,
  NotificationStatus,
} from "@/lib/types/notification";

interface NotificationStore {
  notifications: Notification[];
  config: NotificationConfig | null;
  triggers: NotificationTrigger[];
  loading: boolean;
  unreadCount: number;

  // Notification CRUD
  loadNotifications: (userId: string) => Promise<void>;
  markAsRead: (userId: string, notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (userId: string, notificationId: string) => Promise<void>;
  addNotification: (userId: string, notification: Omit<Notification, "id">) => Promise<void>;

  // Configuration
  loadConfig: (userId: string) => Promise<void>;
  saveConfig: (userId: string, config: Partial<NotificationConfig>) => Promise<void>;

  // Triggers
  loadTriggers: (userId: string) => Promise<void>;
  createTrigger: (userId: string, trigger: Omit<NotificationTrigger, "id" | "createdAt" | "userId">) => Promise<void>;
  updateTrigger: (userId: string, triggerId: string, updates: Partial<NotificationTrigger>) => Promise<void>;

  // Utilities
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  config: null,
  triggers: [],
  loading: false,
  unreadCount: 0,

  loadNotifications: async (userId: string) => {
    try {
      set({ loading: true });
      const res = await fetch('/api/sheets/notifications');
      const data = await res.json();

      if (data.notifications) {
        const notifications: Notification[] = data.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          metadata: JSON.parse(n.metadata || '{}'),
          userId: userId, // Backend doesn't return userId as it's implicit from auth
        }));

        const unreadCount = notifications.filter((n) => n.status === "unread").length;
        set({ notifications, unreadCount });
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (userId: string, notificationId: string) => {
    try {
      const n = get().notifications.find(notif => notif.id === notificationId);
      if (!n) return;

      const updated = { ...n, status: "read" as NotificationStatus, readAt: new Date().toISOString() };
      await fetch('/api/sheets/notifications', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });

      // Update local state
      const notifications = get().notifications.map((notif) =>
        notif.id === notificationId
          ? { ...notif, status: "read" as NotificationStatus, readAt: new Date() }
          : notif
      );
      const unreadCount = notifications.filter((notif) => notif.status === "unread").length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const unreadNotifications = get().notifications.filter((n) => n.status === "unread");
      const now = new Date();

      for (const n of unreadNotifications) {
        const updated = { ...n, status: "read" as NotificationStatus, readAt: now.toISOString() };
        await fetch('/api/sheets/notifications', {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
      }

      // Update local state
      const notifications = get().notifications.map((n) => ({
        ...n,
        status: "read" as NotificationStatus,
        readAt: n.status === "unread" ? now : n.readAt,
      }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  deleteNotification: async (userId: string, notificationId: string) => {
    try {
      await fetch(`/api/sheets/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      // Update local state
      const notifications = get().notifications.filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter((n) => n.status === "unread").length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  addNotification: async (userId: string, notification: Omit<Notification, "id">) => {
    try {
      await fetch('/api/sheets/notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...notification,
          createdAt: notification.createdAt.toISOString(),
        }),
      });

      // Reload notifications
      await get().loadNotifications(userId);
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  },

  loadConfig: async (userId: string) => {
    try {
      set({ loading: true });
      const res = await fetch('/api/sheets/details');
      const data = await res.json();

      if (data.details && data.details.notification_config) {
        const configData = JSON.parse(data.details.notification_config);
        const config: NotificationConfig = {
          ...configData,
          createdAt: new Date(configData.createdAt),
          updatedAt: new Date(configData.updatedAt),
        };
        set({ config });
      } else {
        set({ config: null });
      }
    } catch (error) {
      console.error("Error loading notification config:", error);
      set({ config: null });
    } finally {
      set({ loading: false });
    }
  },

  saveConfig: async (userId: string, configUpdates: Partial<NotificationConfig>) => {
    try {
      const existingConfig = get().config;
      const res = await fetch('/api/sheets/details');
      const data = await res.json();
      const details = data.details || {};

      const newConfig: NotificationConfig = {
        userId,
        primaryEmail: configUpdates.primaryEmail || existingConfig?.primaryEmail || "",
        ccEmails: configUpdates.ccEmails || existingConfig?.ccEmails || [],
        enableAutoReminders: configUpdates.enableAutoReminders ?? existingConfig?.enableAutoReminders ?? true,
        reminderDaysBefore: configUpdates.reminderDaysBefore ?? existingConfig?.reminderDaysBefore ?? 7,
        createdAt: existingConfig?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      details.notification_config = JSON.stringify(newConfig);

      await fetch('/api/sheets/details', {
        method: 'PUT',
        body: JSON.stringify({ details }),
      });

      set({ config: newConfig });
    } catch (error) {
      console.error("Error saving notification config:", error);
      throw error;
    }
  },

  loadTriggers: async (userId: string) => {
    try {
      const res = await fetch('/api/sheets/triggers');
      const data = await res.json();

      if (data.triggers) {
        const triggers: NotificationTrigger[] = data.triggers.map((t: any) => ({
          ...t,
          emiPaymentIds: t.emiPaymentIds ? t.emiPaymentIds.split(',') : [],
          ccEmails: t.ccEmails ? t.ccEmails.split(',') : [],
          scheduledFor: new Date(t.scheduledFor),
          createdAt: new Date(t.createdAt),
          sentAt: t.sentAt ? new Date(t.sentAt) : undefined,
          userId: userId,
        }));

        set({ triggers });
      }
    } catch (error) {
      console.error("Error loading notification triggers:", error);
      set({ triggers: [] });
    }
  },

  createTrigger: async (userId: string, trigger: Omit<NotificationTrigger, "id" | "createdAt" | "userId">) => {
    try {
      await fetch('/api/sheets/triggers', {
        method: 'POST',
        body: JSON.stringify({
          ...trigger,
          scheduledFor: trigger.scheduledFor.toISOString(),
          sentAt: trigger.sentAt?.toISOString(),
        }),
      });

      // Reload triggers
      await get().loadTriggers(userId);
    } catch (error) {
      console.error("Error creating notification trigger:", error);
      throw error;
    }
  },

  updateTrigger: async (userId: string, triggerId: string, updates: Partial<NotificationTrigger>) => {
    try {
      const t = get().triggers.find(trig => trig.id === triggerId);
      if (!t) return;

      const updated = {
        ...t,
        ...updates,
        scheduledFor: (updates.scheduledFor || t.scheduledFor).toISOString(),
        sentAt: updates.sentAt ? updates.sentAt.toISOString() : (t.sentAt ? t.sentAt.toISOString() : undefined),
      };

      await fetch('/api/sheets/triggers', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });

      // Reload triggers
      await get().loadTriggers(userId);
    } catch (error) {
      console.error("Error updating notification trigger:", error);
      throw error;
    }
  },

  clearNotifications: () => set({ notifications: [], config: null, triggers: [], unreadCount: 0 }),
}));

