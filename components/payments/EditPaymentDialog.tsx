"use client";

import { useState, useEffect } from "react";
import { useEMIStore } from "@/lib/store/emiStore";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EMIRow } from "@/lib/google-sheets/schema";
import { numberToIndianWords } from "@/lib/utils/numberToWords";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: EMIRow;
  onSuccess: () => void;
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: EditPaymentDialogProps) {
  const { user } = useAuthStore();
  const { updateEMI } = useEMIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    status: payment.status as "paid" | "pending" | "overdue",
    paymentDate: payment.paymentDate
      ? new Date(payment.paymentDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    paymentMethod: payment.paymentMethod || "",
    transactionId: payment.transactionId || "",
    notes: payment.notes || "",
  });

  // Update form data when payment prop changes
  useEffect(() => {
    setFormData({
      amount: payment.amount.toString(),
      status: payment.status as "paid" | "pending" | "overdue",
      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMethod: payment.paymentMethod || "",
      transactionId: payment.transactionId || "",
      notes: payment.notes || "",
    });
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        toast.error("Please enter a valid amount");
        return;
      }

      await updateEMI({
        ...payment,
        amount: amount,
        status: formData.status,
        paymentDate:
          formData.status === "paid"
            ? new Date(formData.paymentDate).toISOString()
            : "",
        paymentMethod: formData.paymentMethod || "",
        transactionId: formData.transactionId || "",
        notes: formData.notes || "",
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

  const amountInWords = parseFloat(formData.amount)
    ? numberToIndianWords(parseFloat(formData.amount))
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Edit EMI Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Borrow Source</Label>
              <Input
                value={payment.borrowName}
                disabled
                className="bg-slate-800/50 border-slate-700 text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                value={new Date(payment.dueDate).toLocaleDateString()}
                disabled
                className="bg-slate-800/50 border-slate-700 text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="pl-7 bg-slate-800 border-slate-700 focus:border-blue-500 text-white"
                placeholder="0.00"
                required
              />
            </div>
            {amountInWords && (
              <p className="text-xs text-blue-400/80 italic">{amountInWords} Rupees Only</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "paid" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Reference number"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Add any additional details"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white min-w-[120px]"
            >
              {loading ? "Updating..." : "Update Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
