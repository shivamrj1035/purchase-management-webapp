"use client";

import { useState } from "react";
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
import { formatCurrency, formatDate } from "@/lib/utils/emiCalculator";

interface Payment {
  id: string;
  fundingSourceName: string;
  monthNumber?: number;
  dueDate: Date;
  amount: number;
}

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onConfirm: (paymentMethod: string, notes: string) => void;
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  payment,
  onConfirm,
}: MarkAsPaidDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await onConfirm(paymentMethod, notes);

    setLoading(false);
    setPaymentMethod("bank_transfer");
    setNotes("");
    onOpenChange(false);
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Payment as Paid</DialogTitle>
          <DialogDescription className="text-slate-400">
            Record payment method and add notes for this EMI payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Details Summary */}
          <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">
              {payment.fundingSourceName}
            </h3>
            <div className="space-y-1 text-sm">
              {payment.monthNumber && (
                <p className="text-slate-400">Month {payment.monthNumber}</p>
              )}
              <p className="text-slate-400">
                Amount: {formatCurrency(payment.amount)}
              </p>
              <p className="text-slate-400">
                Due Date: {formatDate(payment.dueDate)}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="net_banking">Net Banking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add transaction ID, reference number, or other notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setPaymentMethod("bank_transfer");
                setNotes("");
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
