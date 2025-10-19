"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import { usePropertyStore } from "@/lib/store/propertyStore";
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
  ArrowUpCircle,
  Building2,
  FileText,
  DollarSign,
  IndianRupee,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/emiCalculator";
import AddOutgoingPaymentDialog from "@/components/outgoing/AddOutgoingPaymentDialog";
import EditOutgoingPaymentDialog from "@/components/outgoing/EditOutgoingPaymentDialog";

export interface OutgoingPayment {
  id: string;
  category:
    | "builder_payment"
    | "registration"
    | "legal_fees"
    | "stamp_duty"
    | "other";
  description: string;
  amount: number;
  paymentDate: Date;
  status: "paid" | "pending";
  recipientName?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function OutgoingPaymentsPage() {
  const { user } = useAuthStore();
  const { propertyDetails, getTotalCost } = usePropertyStore();
  const [payments, setPayments] = useState<OutgoingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<OutgoingPayment | null>(null);

  const fetchPayments = async () => {
    const userId = user?.userId || "dev-user";

    try {
      setLoading(true);
      const paymentsRef = collection(db, "users", userId, "outgoingPayments");
      const snapshot = await getDocs(paymentsRef);

      const paymentsData: OutgoingPayment[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category,
          description: data.description,
          amount: data.amount,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          status: data.status,
          recipientName: data.recipientName,
          paymentMethod: data.paymentMethod,
          receiptNumber: data.receiptNumber,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const handleDelete = async (paymentId: string) => {
    const userId = user?.userId || "dev-user";

    if (!confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId, "outgoingPayments", paymentId));
      toast.success("Payment deleted successfully");
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = totalPaid + totalPending;

  // Calculate pending amount based on property details
  const totalPropertyCost = getTotalCost();
  const pendingPaymentAmount = totalPropertyCost - totalPaid;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      builder_payment: "Builder Payment",
      registration: "Registration Fees",
      legal_fees: "Legal Fees",
      stamp_duty: "Stamp Duty",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      builder_payment: "text-blue-500",
      registration: "text-purple-500",
      legal_fees: "text-amber-500",
      stamp_duty: "text-red-500",
      other: "text-slate-500",
    };
    return colors[category] || "text-slate-500";
  };

  const getStatusColor = (status: string) => {
    return status === "paid"
      ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50"
      : "bg-amber-500/20 text-amber-500 border-amber-500/50";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Outgoing Payments</h1>
          <p className="text-slate-400 mt-1">
            Track builder payments, fees, and other payments
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Property Total Cost */}
        {propertyDetails && (
          <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Total Property Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalPropertyCost)}
              </div>
              <p className="text-xs text-blue-300 mt-1">Purchase + All Fees</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Total Payments Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {payments.length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <IndianRupee className="h-4 w-4 mr-2 text-emerald-500" />
              Paid
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
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(Math.max(0, pendingPaymentAmount))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {propertyDetails ? "Remaining to pay" : "Set property details"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Details Alert */}
      {!propertyDetails && (
        <Card className="bg-amber-900/20 border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Settings className="h-6 w-6 text-amber-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-200 mb-1">
                  Configure Property Details
                </h3>
                <p className="text-sm text-amber-300 mb-3">
                  Set your property purchase price and fees to accurately track
                  pending payments. The system will automatically calculate the
                  remaining amount based on payments made.
                </p>
                <Button
                  onClick={() => {
                    // TODO: Add property details configuration dialog
                    toast.info("Property configuration coming soon!");
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Property Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-slate-400">
                All outgoing payments
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No payments found</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment
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
                        {payment.description}
                      </h3>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                      <span
                        className={`text-sm ${getCategoryColor(
                          payment.category
                        )}`}
                      >
                        {getCategoryLabel(payment.category)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span>Amount: {formatCurrency(payment.amount)}</span>
                      <span>•</span>
                      <span>Date: {formatDate(payment.paymentDate)}</span>
                      {payment.recipientName && (
                        <>
                          <span>•</span>
                          <span>To: {payment.recipientName}</span>
                        </>
                      )}
                      {payment.receiptNumber && (
                        <>
                          <span>•</span>
                          <span>Receipt: {payment.receiptNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

      <AddOutgoingPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchPayments}
      />
      {selectedPayment && (
        <EditOutgoingPaymentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          payment={selectedPayment}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  );
}
