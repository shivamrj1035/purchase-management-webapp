"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { numberToIndianWords } from "@/lib/utils/numberToWords";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fundingSources: any[];
  onSuccess: () => void;
}

export default function AddPaymentDialog({
  open,
  onOpenChange,
  fundingSources,
  onSuccess,
}: AddPaymentDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fundingSourceId: "",
    dueDate: new Date().toISOString().split("T")[0],
    amount: "",
    status: "pending" as "paid" | "pending" | "overdue",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    transactionId: "",
    notes: "",
  });

  // Calculate next due date when funding source is selected
  useEffect(() => {
    const calculateNextDueDate = async () => {
      if (!formData.fundingSourceId || !user?.userId) return;

      const selectedSource = fundingSources.find(
        (s) => s.id === formData.fundingSourceId
      );
      if (!selectedSource) return;

      try {
        // Get the latest EMI payment for this funding source
        const emiPaymentsRef = collection(
          db,
          "users",
          user.userId,
          "emiPayments"
        );
        const q = query(
          emiPaymentsRef,
          where("fundingSourceId", "==", formData.fundingSourceId),
          orderBy("dueDate", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        let nextDueDate = new Date();

        if (!snapshot.empty) {
          // Get the last due date and add 1 month
          const lastPayment = snapshot.docs[0].data();
          const lastDueDate = lastPayment.dueDate.toDate();
          nextDueDate = new Date(lastDueDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        } else {
          // If no payments exist, use the funding source start date
          const startDate = selectedSource.startDate?.toDate() || new Date();
          nextDueDate = new Date(startDate);
          // Add 1 month to start date
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        // Set the calculated due date and EMI amount
        setFormData((prev) => ({
          ...prev,
          dueDate: nextDueDate.toISOString().split("T")[0],
          amount: selectedSource.emiAmount?.toString() || "",
        }));
      } catch (error) {
        console.error("Error calculating next due date:", error);
      }
    };

    calculateNextDueDate();
  }, [formData.fundingSourceId, fundingSources, user?.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submission without user for development
    const userId = user?.userId || "dev-user";

    try {
      setLoading(true);

      if (!formData.fundingSourceId || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const selectedSource = fundingSources.find(
        (s) => s.id === formData.fundingSourceId
      );
      if (!selectedSource) {
        toast.error("Please select a valid funding source");
        return;
      }

      const paymentsRef = collection(db, "users", userId, "emiPayments");
      await addDoc(paymentsRef, {
        fundingSourceId: formData.fundingSourceId,
        fundingSourceName: selectedSource.sourceName,
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
        amount: amount,
        status: formData.status,
        paymentDate:
          formData.status === "paid"
            ? Timestamp.fromDate(new Date(formData.paymentDate))
            : null,
        paymentMethod: formData.paymentMethod || null,
        transactionId: formData.transactionId || null,
        notes: formData.notes || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Payment recorded successfully");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        fundingSourceId: "",
        dueDate: new Date().toISOString().split("T")[0],
        amount: "",
        status: "pending",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "",
        transactionId: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record EMI Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Record a new EMI payment for your loan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Funding Source */}
          <div className="space-y-2">
            <Label htmlFor="fundingSourceId">
              Funding Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.fundingSourceId}
              onValueChange={(value) =>
                setFormData({ ...formData, fundingSourceId: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select funding source" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {fundingSources
                  .filter((s) => s.sourceType === "bank_loan")
                  .map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.sourceName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="e.g., 43391"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <p className="text-xs text-emerald-400 mt-1">
                  {numberToIndianWords(formData.amount)}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields for paid status */}
          {formData.status === "paid" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Date */}
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentDate: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    placeholder="e.g., NEFT, UPI"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="e.g., TXN123456789"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
