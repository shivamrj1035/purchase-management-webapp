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
import { calculateEMI } from "@/lib/utils/emiCalculator";
import { FundingSource } from "@/app/(dashboard)/funding-sources/page";

interface EditFundingSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: FundingSource;
  onSuccess: () => void;
}

export default function EditFundingSourceDialog({
  open,
  onOpenChange,
  source,
  onSuccess,
}: EditFundingSourceDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    principalAmount: source.principalAmount.toString(),
    interestRate: source.interestRate.toString(),
    tenureMonths: source.tenureMonths.toString(),
    startDate: source.startDate.toISOString().split("T")[0],
    status: source.status,
    bankName: source.bankName || "",
    accountNumber: source.accountNumber || "",
    notes: source.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      if (!formData.sourceName || !formData.principalAmount) {
        toast.error("Please fill in all required fields");
        return;
      }

      const principal = parseFloat(formData.principalAmount);
      const rate =
        formData.sourceType === "bank_loan"
          ? parseFloat(formData.interestRate)
          : 0;
      const tenure =
        formData.sourceType === "bank_loan"
          ? parseInt(formData.tenureMonths)
          : 0;

      if (principal <= 0) {
        toast.error("Principal amount must be greater than 0");
        return;
      }

      if (formData.sourceType === "bank_loan" && (rate < 0 || tenure <= 0)) {
        toast.error(
          "Please enter valid interest rate and tenure for bank loan"
        );
        return;
      }

      const emiAmount =
        formData.sourceType === "bank_loan"
          ? calculateEMI(principal, rate, tenure)
          : 0;

      const sourceRef = doc(
        db,
        "users",
        user.userId,
        "fundingSources",
        source.id
      );
      await updateDoc(sourceRef, {
        sourceName: formData.sourceName,
        sourceType: formData.sourceType,
        principalAmount: principal,
        interestRate: rate,
        tenureMonths: tenure,
        emiAmount: emiAmount,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        status: formData.status,
        bankName: formData.bankName || null,
        accountNumber: formData.accountNumber || null,
        notes: formData.notes || null,
        updatedAt: Timestamp.now(),
      });

      toast.success("Funding source updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating funding source:", error);
      toast.error("Failed to update funding source");
    } finally {
      setLoading(false);
    }
  };

  const isBankLoan = formData.sourceType === "bank_loan";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Funding Source</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the funding source details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceName">
              Source Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sourceName"
              placeholder="e.g., HDFC Home Loan, Personal Savings"
              value={formData.sourceName}
              onChange={(e) =>
                setFormData({ ...formData, sourceName: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <Select
              value={formData.sourceType}
              onValueChange={(value: any) =>
                setFormData({ ...formData, sourceType: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="bank_loan">Bank Loan</SelectItem>
                <SelectItem value="personal_contribution">
                  Personal Contribution
                </SelectItem>
                <SelectItem value="family_support">Family Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="principalAmount">
              Principal Amount (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="principalAmount"
              type="number"
              step="0.01"
              placeholder="e.g., 5000000"
              value={formData.principalAmount}
              onChange={(e) =>
                setFormData({ ...formData, principalAmount: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {isBankLoan && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">
                    Interest Rate (% p.a.){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.5"
                    value={formData.interestRate}
                    onChange={(e) =>
                      setFormData({ ...formData, interestRate: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenureMonths">
                    Tenure (Months) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tenureMonths"
                    type="number"
                    placeholder="e.g., 240"
                    value={formData.tenureMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, tenureMonths: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g., XXXXXXXXX1234"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or details..."
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
              {loading ? "Updating..." : "Update Funding Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
