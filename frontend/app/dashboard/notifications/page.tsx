"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellRing,
  Mail,
  Settings,
  Trash2,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const {
    notifications,
    config,
    triggers,
    loading,
    unreadCount,
    loadNotifications,
    loadConfig,
    loadTriggers,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    saveConfig,
  } = useNotificationStore();

  const [emailConfig, setEmailConfig] = useState({
    primaryEmail: "",
    ccEmails: [] as string[],
    enableAutoReminders: true,
    reminderDaysBefore: 7,
  });

  const [newCcEmail, setNewCcEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testingSending, setTestingSending] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadNotifications(user.userId);
      loadConfig(user.userId);
      loadTriggers(user.userId);
    }
  }, [user, loadNotifications, loadConfig, loadTriggers]);

  useEffect(() => {
    if (config) {
      setEmailConfig({
        primaryEmail: config.primaryEmail || user?.email || "",
        ccEmails: config.ccEmails || [],
        enableAutoReminders: config.enableAutoReminders ?? true,
        reminderDaysBefore: config.reminderDaysBefore ?? 7,
      });
    } else if (user?.email) {
      setEmailConfig((prev) => ({ ...prev, primaryEmail: user.email }));
    }
  }, [config, user]);

  const handleSaveConfig = async () => {
    if (!user?.userId) return;

    try {
      setSaving(true);
      await saveConfig(user.userId, emailConfig);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCcEmail = () => {
    if (!newCcEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCcEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailConfig.ccEmails.includes(newCcEmail)) {
      toast.error("Email already added");
      return;
    }

    setEmailConfig({
      ...emailConfig,
      ccEmails: [...emailConfig.ccEmails, newCcEmail],
    });
    setNewCcEmail("");
  };

  const handleRemoveCcEmail = (email: string) => {
    setEmailConfig({
      ...emailConfig,
      ccEmails: emailConfig.ccEmails.filter((e) => e !== email),
    });
  };

  const handleTestEmail = async () => {
    if (!user?.email || !user?.username) return;

    try {
      // Get API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      setTestingSending(true);
      const response = await fetch(`${apiUrl}/api/notifications/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: emailConfig.primaryEmail,
          userName: user.username,
        }),
      });

      if (response.ok) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        const error = await response.json();
        const errorMessage =
          typeof error.detail === "string"
            ? error.detail
            : error.detail?.[0]?.msg || "Failed to send test email";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      const errorMessage = error?.message || "Failed to send test email";
      toast.error(errorMessage);
    } finally {
      setTestingSending(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.userId) return;
    try {
      await markAsRead(user.userId, notificationId);
      toast.success("Marked as read");
    } catch (error: any) {
      console.error("Error marking as read:", error);
      const errorMessage = error?.message || "Failed to mark as read";
      toast.error(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;
    try {
      await markAllAsRead(user.userId);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      const errorMessage = error?.message || "Failed to mark all as read";
      toast.error(errorMessage);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user?.userId) return;
    try {
      await deleteNotification(user.userId, notificationId);
      toast.success("Notification deleted");
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      const errorMessage = error?.message || "Failed to delete notification";
      toast.error(errorMessage);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "emi_reminder":
        return <BellRing className="h-5 w-5 text-blue-400" />;
      case "payment_due":
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case "payment_overdue":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
            <Bell className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
            Notifications
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">
            Manage your notification preferences and view alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="h-7 md:h-8 px-3 md:px-4 text-base md:text-lg"
          >
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      <Tabs defaultValue="settings" className="space-y-4 md:space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-3 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-slate-700 text-xs sm:text-sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-slate-700 text-xs sm:text-sm"
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 sm:ml-2 h-4 px-1 text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-slate-700 text-xs sm:text-sm"
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                Email Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure email settings for EMI payment reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Email */}
              <div className="space-y-2">
                <Label htmlFor="primaryEmail" className="text-slate-300">
                  Primary Email Address
                </Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={emailConfig.primaryEmail}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      primaryEmail: e.target.value,
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="your-email@example.com"
                />
                <p className="text-xs text-slate-500">
                  All EMI reminders will be sent to this email
                </p>
              </div>

              {/* CC Emails */}
              <div className="space-y-3">
                <Label className="text-slate-300">
                  CC Email Addresses (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newCcEmail}
                    onChange={(e) => setNewCcEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCcEmail()}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="additional-email@example.com"
                  />
                  <Button
                    onClick={handleAddCcEmail}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {emailConfig.ccEmails.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {emailConfig.ccEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700"
                      >
                        <span className="text-slate-300">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCcEmail(email)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Additional recipients will receive a copy of all EMI reminders
                </p>
              </div>

              {/* Auto Reminders */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div>
                  <Label className="text-slate-300">
                    Enable Auto Reminders
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Automatically send reminders before EMI due dates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailConfig.enableAutoReminders}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      enableAutoReminders: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* Reminder Days Before */}
              {emailConfig.enableAutoReminders && (
                <div className="space-y-2">
                  <Label htmlFor="reminderDays" className="text-slate-300">
                    Send Reminder (Days Before Due Date)
                  </Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    min="1"
                    max="30"
                    value={emailConfig.reminderDaysBefore}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        reminderDaysBefore: parseInt(e.target.value) || 7,
                      })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Reminders will be sent {emailConfig.reminderDaysBefore} days
                    before the due date
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                <Button
                  onClick={handleSaveConfig}
                  disabled={saving || !emailConfig.primaryEmail}
                  className="bg-blue-600 hover:bg-blue-700 flex-1 w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleTestEmail}
                  disabled={testingSending || !emailConfig.primaryEmail}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
                >
                  {testingSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 w-full sm:w-auto"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-400">
                  No Notifications
                </h3>
                <p className="text-slate-500 mt-2">
                  You&apos;re all caught up! No new notifications at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications
                .filter((n) => n.status === "unread")
                .map((notification) => (
                  <Card
                    key={notification.id}
                    className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors"
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-white text-sm md:text-base truncate">
                                {notification.title}
                              </h4>
                              {notification.status === "unread" && (
                                <Badge
                                  variant="default"
                                  className="bg-blue-600 text-xs"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm break-words">
                              {notification.message}
                            </p>
                            <p className="text-slate-600 text-xs mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                          {notification.status === "unread" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {triggers.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Clock className="h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-400">
                  No Notification History
                </h3>
                <p className="text-slate-500 mt-2">
                  No notifications have been sent yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {triggers.map((trigger) => (
                <Card
                  key={trigger.id}
                  className="bg-slate-800 border-slate-700"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">
                            {trigger.emiPaymentIds.length} EMI Reminder
                            {trigger.emiPaymentIds.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {trigger.sentAt
                              ? `Sent on ${formatDate(trigger.sentAt)}`
                              : `Scheduled for ${formatDate(
                                  trigger.scheduledFor
                                )}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          trigger.status === "sent"
                            ? "default"
                            : trigger.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          trigger.status === "sent"
                            ? "bg-green-600"
                            : trigger.status === "pending"
                            ? "bg-amber-600"
                            : ""
                        }
                      >
                        {trigger.status}
                      </Badge>
                    </div>
                    {trigger.ccEmails.length > 0 && (
                      <p className="text-slate-500 text-xs mt-2">
                        CC: {trigger.ccEmails.join(", ")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
