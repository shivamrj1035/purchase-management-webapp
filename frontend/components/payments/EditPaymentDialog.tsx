"use client";

import { useState } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
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
import { Payment } from "@/lib/types/payment";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  fundingSources: any[];
  onSuccess: () => void;
}

export default function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  fundingSources,
  onSuccess,
}: EditPaymentDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fundingSourceId: payment.fundingSourceId,
    dueDate: payment.dueDate.toISOString().split("T")[0],
    amount: payment.amount.toString(),
    status: payment.status,
    paymentDate: payment.paymentDate.toISOString().split("T")[0],
    paymentMethod: payment.paymentMethod || "",
    transactionId: payment.transactionId || "",
    notes: payment.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = user?.userId || "dev-user";

    try {
      setLoading(true);

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const selectedSource = fundingSources.find(
        (s) => s.id === formData.fundingSourceId
      );

      const paymentRef = doc(
        db,
        "users",
        userId,
        "incomingPayments",
        payment.id
      );
      await updateDoc(paymentRef, {
        fundingSourceId: formData.fundingSourceId,
        fundingSourceName:
          selectedSource?.sourceName || payment.fundingSourceName,
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
        updatedAt: Timestamp.now(),
      });

      toast.success("Payment updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update payment details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fundingSourceId">Funding Source</Label>
            <Select
              value={formData.fundingSourceId}
              onValueChange={(value) =>
                setFormData({ ...formData, fundingSourceId: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

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

          {formData.status === "paid" && (
            <>
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
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

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

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
              {loading ? "Updating..." : "Update Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
