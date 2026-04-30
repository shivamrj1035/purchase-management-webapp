"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import {
  Send,
  Loader2,
  Mail,
  Plus,
  X,
  Calendar,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface EMIPaymentForNotification {
  id: string;
  fundingSourceName: string;
  monthNumber: number;
  amount: number;
  dueDate: Date;
  status: string;
}

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEMIs: EMIPaymentForNotification[];
  onSuccess?: () => void;
}

export function SendNotificationDialog({
  open,
  onOpenChange,
  selectedEMIs,
  onSuccess,
}: SendNotificationDialogProps) {
  const { user } = useAuthStore();
  const { config, loadConfig, createTrigger } = useNotificationStore();
  const [sending, setSending] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [newCcEmail, setNewCcEmail] = useState("");

  useEffect(() => {
    if (user?.userId) {
      loadConfig(user.userId);
    }
  }, [user, loadConfig]);

  useEffect(() => {
    if (config?.ccEmails) {
      setCcEmails(config.ccEmails);
    }
  }, [config]);

  const handleAddCcEmail = () => {
    if (!newCcEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCcEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (ccEmails.includes(newCcEmail)) {
      toast.error("Email already added");
      return;
    }

    setCcEmails([...ccEmails, newCcEmail]);
    setNewCcEmail("");
  };

  const handleRemoveCcEmail = (email: string) => {
    setCcEmails(ccEmails.filter((e) => e !== email));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateTotalAmount = () => {
    return selectedEMIs.reduce((sum, emi) => sum + emi.amount, 0);
  };

  const handleSendNotification = async () => {
    if (!user?.userId || !user?.email || !user?.username) {
      toast.error("User information not available");
      return;
    }

    if (!config?.primaryEmail) {
      toast.error("Please configure your email in notification settings first");
      return;
    }

    if (selectedEMIs.length === 0) {
      toast.error("No EMI payments selected");
      return;
    }

    try {
      setSending(true);

      // Prepare EMI data for API
      const emiList = selectedEMIs.map((emi) => ({
        funding_source_name: emi.fundingSourceName,
        month_number: emi.monthNumber,
        amount: emi.amount,
        due_date: emi.dueDate.toISOString(),
        status: emi.status,
      }));

      // Determine endpoint based on number of EMIs
      const endpoint =
        selectedEMIs.length === 1
          ? "/api/notifications/send-emi-reminder"
          : "/api/notifications/send-bulk-emi-reminders";

      const requestBody =
        selectedEMIs.length === 1
          ? {
              userId: user.userId,
              userName: user.username,
              userEmail: config.primaryEmail,
              emiDetails: emiList[0],
              ccEmails: ccEmails,
            }
          : {
              userId: user.userId,
              userName: user.username,
              userEmail: config.primaryEmail,
              emiList: emiList,
              ccEmails: ccEmails,
            };

      // Send notification via API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage =
          typeof error.detail === "string"
            ? error.detail
            : error.detail?.[0]?.msg || "Failed to send notification";
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Create notification trigger record in Google Sheets
      await createTrigger(user.userId, {
        emiPaymentIds: selectedEMIs.map((emi) => emi.id),
        scheduledFor: new Date(),
        status: "sent",
        ccEmails: ccEmails,
        sentAt: new Date(),
      });

      toast.success(
        `Notification sent successfully to ${config.primaryEmail}${
          ccEmails.length > 0 ? ` and ${ccEmails.length} CC recipient(s)` : ""
        }`
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      const errorMessage = error?.message || "Failed to send notification";

      // Provide helpful error messages based on error type
      if (
        errorMessage.includes("Network is unreachable") ||
        errorMessage.includes("[Errno 101]")
      ) {
        toast.error(
          "Email service unavailable. SMTP is blocked on this server. Please contact administrator to configure SendGrid.",
          { duration: 6000 }
        );
      } else if (errorMessage.includes("SendGrid")) {
        toast.error(
          "SendGrid configuration error. Please verify API key in backend settings.",
          { duration: 5000 }
        );
      } else if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("credentials")
      ) {
        toast.error(
          "Email authentication failed. Please check email configuration in notification settings.",
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage, { duration: 5000 });
      }

      // Record failed trigger
      if (user?.userId) {
        try {
          await createTrigger(user.userId, {
            emiPaymentIds: selectedEMIs.map((emi) => emi.id),
            scheduledFor: new Date(),
            status: "failed",
            ccEmails: ccEmails,
            errorMessage: errorMessage,
          });
        } catch (triggerError) {
          console.error("Error creating failed trigger:", triggerError);
        }
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Send className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
            <span className="truncate">Send EMI Payment Reminder</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Send email notification for selected EMI payment
            {selectedEMIs.length > 1 ? "s" : ""}. Email will be sent via
            SendGrid (production) or Gmail (local development).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          {/* Email Configuration Check */}
          {!config?.primaryEmail ? (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-400 text-sm md:text-base">
                    Email Not Configured
                  </h4>
                  <p className="text-xs md:text-sm text-red-300 mt-1">
                    Please configure your email address in the Notification
                    Settings before sending reminders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Primary Email Display */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm md:text-base">
                  To (Primary Email)
                </Label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 md:p-3 rounded-lg border border-slate-700">
                  <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-white text-sm md:text-base truncate">
                    {config.primaryEmail}
                  </span>
                </div>
              </div>

              {/* CC Emails */}
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm md:text-base">
                  CC (Carbon Copy)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newCcEmail}
                    onChange={(e) => setNewCcEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCcEmail()}
                    className="bg-slate-900 border-slate-700 text-white text-sm"
                    placeholder="additional-email@example.com"
                  />
                  <Button
                    onClick={handleAddCcEmail}
                    className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {ccEmails.length > 0 && (
                  <div className="space-y-2">
                    {ccEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700"
                      >
                        <span className="text-slate-300 text-xs md:text-sm truncate">
                          {email}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCcEmail(email)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 md:h-7 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected EMIs Summary */}
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm md:text-base">
                  Selected EMI Payment{selectedEMIs.length > 1 ? "s" : ""} (
                  {selectedEMIs.length})
                </Label>
                <div className="bg-slate-900 rounded-lg border border-slate-700 max-h-48 md:max-h-64 overflow-y-auto">
                  {selectedEMIs.map((emi) => (
                    <div
                      key={emi.id}
                      className="p-3 border-b border-slate-700 last:border-0 hover:bg-slate-800/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm md:text-base truncate">
                            {emi.fundingSourceName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              Month {emi.monthNumber}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">
                              Due: {formatDate(emi.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                          <p className="font-semibold text-blue-400 flex items-center gap-1 text-sm md:text-base">
                            <IndianRupee className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="truncate">
                              {formatCurrency(emi.amount).replace("₹", "")}
                            </span>
                          </p>
                          <Badge
                            variant={
                              emi.status === "overdue"
                                ? "destructive"
                                : emi.status === "pending"
                                ? "secondary"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {emi.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total Amount */}
                  {selectedEMIs.length > 1 && (
                    <div className="p-3 bg-slate-800 font-semibold">
                      <div className="flex items-center justify-between text-white text-sm md:text-base">
                        <span>Total Amount</span>
                        <span className="text-base md:text-lg text-blue-400 truncate">
                          {formatCurrency(calculateTotalAmount())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            disabled={
              sending || !config?.primaryEmail || selectedEMIs.length === 0
            }
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
