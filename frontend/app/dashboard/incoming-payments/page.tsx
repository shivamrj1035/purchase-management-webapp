"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CenteredLoader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  RefreshCw,
  AlertCircle,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/emiCalculator";
import { syncEMIPayments } from "@/lib/utils/emiManager";
import AddPaymentDialog from "@/components/payments/AddPaymentDialog";
import EditPaymentDialog from "@/components/payments/EditPaymentDialog";
import MarkAsPaidDialog from "@/components/payments/MarkAsPaidDialog";
import { SendNotificationDialog } from "@/components/payments/SendNotificationDialog";

export interface Payment {
  id: string;
  fundingSourceId: string;
  fundingSourceName: string;
  monthNumber?: number;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function IncomingPaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fundingSources, setFundingSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">(
    "all"
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isSendNotificationDialogOpen, setIsSendNotificationDialogOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedEMIsForNotification, setSelectedEMIsForNotification] =
    useState<Payment[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Sync EMI payments on component mount
  const handleSyncEMIPayments = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      const result = await syncEMIPayments(user.userId);

      const messages = [];
      if (result.duplicatesRemoved > 0) {
        messages.push(`Removed ${result.duplicatesRemoved} duplicate(s)`);
      }
      if (result.created > 0) {
        messages.push(`Created ${result.created} new EMI(s)`);
      }
      if (result.updated > 0) {
        messages.push(`Updated ${result.updated} to overdue`);
      }

      if (messages.length > 0) {
        toast.success(`Synced! ${messages.join(", ")}`);
      } else {
        toast.info("All EMI payments are up to date");
      }

      await fetchData();
    } catch (error) {
      console.error("Error syncing EMI payments:", error);
      toast.error("Failed to sync EMI payments");
    } finally {
      setSyncing(false);
    }
  };

  // Fetch funding sources and payments
  const fetchData = async () => {
    if (!user) {
      // For development without auth
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch funding sources
      const sourcesRef = collection(db, "users", user.userId, "fundingSources");
      const sourcesSnapshot = await getDocs(sourcesRef);
      const sources = sourcesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFundingSources(sources);

      // Fetch payments from emiPayments collection
      const paymentsRef = collection(db, "users", user.userId, "emiPayments");
      const paymentsSnapshot = await getDocs(paymentsRef);

      const paymentsData: Payment[] = paymentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fundingSourceId: data.fundingSourceId,
          fundingSourceName: data.fundingSourceName,
          monthNumber: data.monthNumber,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          amount: data.amount,
          status: data.status,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Delete payment
  const handleDelete = async (paymentId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.userId, "emiPayments", paymentId));
      toast.success("Payment deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  // Mark as paid with payment method and notes
  const handleMarkAsPaid = async (paymentMethod: string, notes: string) => {
    if (!user || !selectedPayment) return;

    try {
      const paymentRef = doc(
        db,
        "users",
        user.userId,
        "emiPayments",
        selectedPayment.id
      );
      await updateDoc(paymentRef, {
        status: "paid",
        paymentDate: Timestamp.now(),
        paymentMethod: paymentMethod,
        notes: notes || null,
        updatedAt: Timestamp.now(),
      });
      toast.success("Payment marked as paid");
      fetchData();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  // Calculate statistics
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  // Get upcoming payments in next 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingPayments = payments
    .filter(
      (p) =>
        (p.status === "pending" || p.status === "overdue") &&
        p.dueDate >= now &&
        p.dueDate <= thirtyDaysFromNow
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const overduePayments = payments
    .filter((p) => p.status === "overdue")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
      pending: "bg-amber-500/20 text-amber-500 border-amber-500/50",
      overdue: "bg-red-500/20 text-red-500 border-red-500/50",
    };
    return (
      colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/50"
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle className="h-4 w-4" />;
    if (status === "overdue") return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">EMI Payments</h1>
          <p className="text-slate-400 mt-1">
            Track your loan EMI payments (Auto-synced)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleSyncEMIPayments}
            disabled={syncing}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync EMI Payments"}
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Manual Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {payments.filter((p) => p.status === "paid").length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {payments.filter((p) => p.status === "pending").length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {payments.filter((p) => p.status === "overdue").length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Next 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {upcomingPayments.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(
                upcomingPayments.reduce((sum, p) => sum + p.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alerts */}
      {overduePayments.length > 0 && (
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Overdue Payments - Action Required!
            </CardTitle>
            <CardDescription className="text-red-300">
              You have {overduePayments.length} overdue payment(s) totaling{" "}
              {formatCurrency(
                overduePayments.reduce((sum, p) => sum + p.amount, 0)
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 min-w-0">
              {overduePayments.map((payment) => {
                const daysOverdue = Math.ceil(
                  (now.getTime() - payment.dueDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-red-900/30 border border-red-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <h4 className="font-semibold text-white">
                          {payment.fundingSourceName}
                        </h4>
                        {payment.monthNumber && (
                          <span className="text-xs text-red-300">
                            Month {payment.monthNumber}
                          </span>
                        )}
                        <span className="text-xs text-red-400">
                          {daysOverdue} day(s) overdue
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-sm text-red-200">
                        <span>Amount: {formatCurrency(payment.amount)}</span>
                        <span>•</span>
                        <span>Due: {formatDate(payment.dueDate)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsMarkPaidDialogOpen(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Pay Now
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments in Next 30 Days */}
      {upcomingPayments.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  Upcoming Payments (Next 30 Days)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {upcomingPayments.length} payment(s) due soon
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSelectedEMIsForNotification(upcomingPayments);
                  setIsSendNotificationDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email Reminder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 min-w-0">
              {upcomingPayments.map((payment) => {
                const daysUntilDue = Math.ceil(
                  (payment.dueDate.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={payment.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg ${
                      daysUntilDue <= 7
                        ? "bg-amber-900/20 border border-amber-800"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <h4 className="font-semibold text-white">
                          {payment.fundingSourceName}
                        </h4>
                        {payment.monthNumber && (
                          <span className="text-xs text-slate-500">
                            Month {payment.monthNumber}
                          </span>
                        )}
                        <span
                          className={`text-xs break-words ${
                            daysUntilDue <= 7
                              ? "text-amber-400"
                              : "text-blue-400"
                          }`}
                        >
                          Due in {daysUntilDue} day(s)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-sm text-slate-400">
                        <span>Amount: {formatCurrency(payment.amount)}</span>
                        <span>•</span>
                        <span>Due: {formatDate(payment.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEMIsForNotification([payment]);
                          setIsSendNotificationDialogOpen(true);
                        }}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsMarkPaidDialogOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Paid
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-slate-400">
                View and manage all EMI payments
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                All
              </Button>
              <Button
                variant={filter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("paid")}
                className={
                  filter === "paid"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                Paid
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={
                  filter === "pending"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                Pending
              </Button>
              <Button
                variant={filter === "overdue" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("overdue")}
                className={
                  filter === "overdue"
                    ? "bg-red-500 hover:bg-red-600"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CenteredLoader message="Loading EMI payments..." />
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No payments found</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Your First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-3 min-w-0">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {payment.fundingSourceName}
                      </h3>
                      {payment.monthNumber && (
                        <span className="text-xs text-slate-500">
                          Month {payment.monthNumber}
                        </span>
                      )}
                      <Badge className={getStatusColor(payment.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-sm text-slate-400">
                      <span>Amount: {formatCurrency(payment.amount)}</span>
                      <span>•</span>
                      <span>Due: {formatDate(payment.dueDate)}</span>
                      {payment.status === "paid" && (
                        <>
                          <span>•</span>
                          <span>Paid: {formatDate(payment.paymentDate)}</span>
                        </>
                      )}
                      {payment.paymentMethod && (
                        <>
                          <span>•</span>
                          <span>{payment.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(payment.status === "pending" ||
                      payment.status === "overdue") && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsMarkPaidDialogOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Paid
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsEditDialogOpen(true);
                      }}
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        fundingSources={fundingSources}
        onSuccess={fetchData}
      />
      {selectedPayment && (
        <>
          <EditPaymentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            payment={selectedPayment}
            fundingSources={fundingSources}
            onSuccess={fetchData}
          />
          <MarkAsPaidDialog
            open={isMarkPaidDialogOpen}
            onOpenChange={setIsMarkPaidDialogOpen}
            payment={selectedPayment}
            onConfirm={handleMarkAsPaid}
          />
        </>
      )}
      <SendNotificationDialog
        open={isSendNotificationDialogOpen}
        onOpenChange={setIsSendNotificationDialogOpen}
        selectedEMIs={selectedEMIsForNotification.map((p) => ({
          id: p.id,
          fundingSourceName: p.fundingSourceName,
          monthNumber: p.monthNumber || 0,
          amount: p.amount,
          dueDate: p.dueDate,
          status: p.status,
        }))}
        onSuccess={() => {
          toast.success("Notification sent successfully!");
          setSelectedEMIsForNotification([]);
        }}
      />
    </div>
  );
}
