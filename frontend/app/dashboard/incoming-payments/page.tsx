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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/emiCalculator";
import AddPaymentDialog from "@/components/payments/AddPaymentDialog";
import EditPaymentDialog from "@/components/payments/EditPaymentDialog";

export interface Payment {
  id: string;
  fundingSourceId: string;
  fundingSourceName: string;
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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

      // Fetch payments
      const paymentsRef = collection(
        db,
        "users",
        user.userId,
        "incomingPayments"
      );
      const paymentsSnapshot = await getDocs(paymentsRef);

      const paymentsData: Payment[] = paymentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fundingSourceId: data.fundingSourceId,
          fundingSourceName: data.fundingSourceName,
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
      await deleteDoc(
        doc(db, "users", user.userId, "incomingPayments", paymentId)
      );
      toast.success("Payment deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  // Mark as paid
  const handleMarkAsPaid = async (payment: Payment) => {
    if (!user) return;

    try {
      const paymentRef = doc(
        db,
        "users",
        user.userId,
        "incomingPayments",
        payment.id
      );
      await updateDoc(paymentRef, {
        status: "paid",
        paymentDate: Timestamp.now(),
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">EMI Payments</h1>
          <p className="text-slate-400 mt-1">Track your loan EMI payments</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Filter Tabs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-slate-400">
                View and manage all EMI payments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "bg-blue-500"
                    : "border-slate-700 text-slate-300"
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
                    ? "bg-emerald-500"
                    : "border-slate-700 text-slate-300"
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
                    ? "bg-amber-500"
                    : "border-slate-700 text-slate-300"
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
                    ? "bg-red-500"
                    : "border-slate-700 text-slate-300"
                }
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
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
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {payment.fundingSourceName}
                      </h3>
                      <Badge className={getStatusColor(payment.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
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
                  <div className="flex items-center gap-2">
                    {payment.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(payment)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
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
        <EditPaymentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          payment={selectedPayment}
          fundingSources={fundingSources}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
