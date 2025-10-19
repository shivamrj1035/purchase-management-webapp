"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
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

interface AddOutgoingPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddOutgoingPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddOutgoingPaymentDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "builder_payment" as
      | "builder_payment"
      | "registration"
      | "legal_fees"
      | "stamp_duty"
      | "other",
    description: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    status: "paid" as "paid" | "pending",
    recipientName: "",
    paymentMethod: "",
    receiptNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.userId || "dev-user";

    try {
      setLoading(true);

      if (!formData.description || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const paymentsRef = collection(db, "users", userId, "outgoingPayments");
      await addDoc(paymentsRef, {
        category: formData.category,
        description: formData.description,
        amount: amount,
        paymentDate: Timestamp.fromDate(new Date(formData.paymentDate)),
        status: formData.status,
        recipientName: formData.recipientName || null,
        paymentMethod: formData.paymentMethod || null,
        receiptNumber: formData.receiptNumber || null,
        notes: formData.notes || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Payment added successfully");
      onSuccess();
      onOpenChange(false);

      setFormData({
        category: "builder_payment",
        description: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "paid",
        recipientName: "",
        paymentMethod: "",
        receiptNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Outgoing Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Record a new expense payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="builder_payment">Builder Payment</SelectItem>
                <SelectItem value="registration">Registration Fees</SelectItem>
                <SelectItem value="legal_fees">Legal Fees</SelectItem>
                <SelectItem value="stamp_duty">Stamp Duty</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., 1st Installment to Builder"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 500000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input
                placeholder="e.g., XYZ Builders"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input
                placeholder="e.g., NEFT, Cheque"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Receipt Number</Label>
            <Input
              placeholder="e.g., RCP-001"
              value={formData.receiptNumber}
              onChange={(e) =>
                setFormData({ ...formData, receiptNumber: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional details..."
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
              {loading ? "Adding..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
