import { create } from "zustand";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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
      const notificationsRef = collection(db, "users", userId, "notifications");
      const q = query(notificationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const notifications: Notification[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          readAt: data.readAt?.toDate(),
          metadata: data.metadata,
        };
      });

      const unreadCount = notifications.filter((n) => n.status === "unread").length;

      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Error loading notifications:", error);
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (userId: string, notificationId: string) => {
    try {
      const notificationRef = doc(db, "users", userId, "notifications", notificationId);
      await updateDoc(notificationRef, {
        status: "read",
        readAt: Timestamp.now(),
      });

      // Update local state
      const notifications = get().notifications.map((n) =>
        n.id === notificationId
          ? { ...n, status: "read" as NotificationStatus, readAt: new Date() }
          : n
      );
      const unreadCount = notifications.filter((n) => n.status === "unread").length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const unreadNotifications = get().notifications.filter((n) => n.status === "unread");

      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, "users", userId, "notifications", notification.id);
        await updateDoc(notificationRef, {
          status: "read",
          readAt: Timestamp.now(),
        });
      }

      // Update local state
      const notifications = get().notifications.map((n) => ({
        ...n,
        status: "read" as NotificationStatus,
        readAt: n.status === "unread" ? new Date() : n.readAt,
      }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  deleteNotification: async (userId: string, notificationId: string) => {
    try {
      const notificationRef = doc(db, "users", userId, "notifications", notificationId);
      await updateDoc(notificationRef, {
        status: "archived",
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
      const notificationsRef = collection(db, "users", userId, "notifications");
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt),
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
      const configRef = doc(db, "users", userId, "config", "notifications");
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const data = configSnap.data();
        const config: NotificationConfig = {
          userId: data.userId,
          primaryEmail: data.primaryEmail,
          ccEmails: data.ccEmails || [],
          enableAutoReminders: data.enableAutoReminders ?? true,
          reminderDaysBefore: data.reminderDaysBefore ?? 7,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
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
      const configRef = doc(db, "users", userId, "config", "notifications");
      const existingConfig = get().config;

      const newConfig: NotificationConfig = {
        userId,
        primaryEmail: configUpdates.primaryEmail || existingConfig?.primaryEmail || "",
        ccEmails: configUpdates.ccEmails || existingConfig?.ccEmails || [],
        enableAutoReminders: configUpdates.enableAutoReminders ?? existingConfig?.enableAutoReminders ?? true,
        reminderDaysBefore: configUpdates.reminderDaysBefore ?? existingConfig?.reminderDaysBefore ?? 7,
        createdAt: existingConfig?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await setDoc(configRef, {
        ...newConfig,
        createdAt: Timestamp.fromDate(newConfig.createdAt),
        updatedAt: Timestamp.now(),
      });

      set({ config: newConfig });
    } catch (error) {
      console.error("Error saving notification config:", error);
      throw error;
    }
  },

  loadTriggers: async (userId: string) => {
    try {
      const triggersRef = collection(db, "users", userId, "notificationTriggers");
      const q = query(triggersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const triggers: NotificationTrigger[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          emiPaymentIds: data.emiPaymentIds || [],
          scheduledFor: data.scheduledFor?.toDate() || new Date(),
          status: data.status,
          ccEmails: data.ccEmails || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
          errorMessage: data.errorMessage,
        };
      });

      set({ triggers });
    } catch (error) {
      console.error("Error loading notification triggers:", error);
      set({ triggers: [] });
    }
  },

  createTrigger: async (userId: string, trigger: Omit<NotificationTrigger, "id" | "createdAt" | "userId">) => {
    try {
      const triggersRef = collection(db, "users", userId, "notificationTriggers");
      await addDoc(triggersRef, {
        ...trigger,
        userId,
        createdAt: Timestamp.now(),
        scheduledFor: Timestamp.fromDate(trigger.scheduledFor),
        sentAt: trigger.sentAt ? Timestamp.fromDate(trigger.sentAt) : null,
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
      const triggerRef = doc(db, "users", userId, "notificationTriggers", triggerId);
      const updateData: any = { ...updates };

      if (updates.scheduledFor) {
        updateData.scheduledFor = Timestamp.fromDate(updates.scheduledFor);
      }
      if (updates.sentAt) {
        updateData.sentAt = Timestamp.fromDate(updates.sentAt);
      }

      await updateDoc(triggerRef, updateData);

      // Reload triggers
      await get().loadTriggers(userId);
    } catch (error) {
      console.error("Error updating notification trigger:", error);
      throw error;
    }
  },

  clearNotifications: () => set({ notifications: [], config: null, triggers: [], unreadCount: 0 }),
}));
