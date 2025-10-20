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
import { calculateEMI } from "@/lib/utils/emiCalculator";
import { numberToIndianWords } from "@/lib/utils/numberToWords";

interface AddFundingSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddFundingSourceDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddFundingSourceDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceName: "",
    sourceType: "bank_loan" as
      | "bank_loan"
      | "personal_loan"
      | "personal_contribution"
      | "family_support"
      | "other",
    principalAmount: "",
    interestType: "percentage" as "percentage" | "fixed_amount" | "none",
    interestRate: "",
    fixedInterestAmount: "",
    tenureMonths: "",
    fundReceivedDate: new Date().toISOString().split("T")[0],
    emiStartDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "closed" | "pending",
    bankName: "",
    accountNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Validate required fields
      if (!formData.sourceName || !formData.principalAmount) {
        toast.error("Please fill in all required fields");
        return;
      }

      const principal = parseFloat(formData.principalAmount);
      const tenure =
        formData.sourceType === "bank_loan" ||
        formData.sourceType === "personal_loan"
          ? parseInt(formData.tenureMonths)
          : 0;

      if (principal <= 0) {
        toast.error("Principal amount must be greater than 0");
        return;
      }

      let emiAmount = 0;
      let rate = 0;

      // Calculate EMI based on interest type
      if (
        formData.sourceType === "bank_loan" ||
        formData.sourceType === "personal_loan"
      ) {
        if (tenure <= 0) {
          toast.error("Please enter valid tenure");
          return;
        }

        if (formData.interestType === "percentage") {
          rate = parseFloat(formData.interestRate);
          if (rate < 0) {
            toast.error("Please enter valid interest rate");
            return;
          }
          emiAmount = calculateEMI(principal, rate, tenure);
        } else if (formData.interestType === "fixed_amount") {
          const fixedInterest = parseFloat(formData.fixedInterestAmount);
          if (fixedInterest <= 0) {
            toast.error("Please enter valid fixed interest amount");
            return;
          }
          // For fixed interest, EMI = fixed interest per month
          // Principal is paid at the end of tenure
          emiAmount = fixedInterest;
        } else {
          // No interest - just principal divided by tenure
          emiAmount = principal / tenure;
        }
      }

      // Create funding source
      const sourcesRef = collection(db, "users", user.userId, "fundingSources");
      await addDoc(sourcesRef, {
        sourceName: formData.sourceName,
        sourceType: formData.sourceType,
        principalAmount: principal,
        interestType: formData.interestType,
        interestRate: rate,
        fixedInterestAmount:
          formData.interestType === "fixed_amount"
            ? parseFloat(formData.fixedInterestAmount)
            : 0,
        tenureMonths: tenure,
        emiAmount: emiAmount,
        fundReceivedDate: Timestamp.fromDate(new Date(formData.fundReceivedDate)),
        emiStartDate: Timestamp.fromDate(new Date(formData.emiStartDate)),
        status: formData.status,
        bankName: formData.bankName || null,
        accountNumber: formData.accountNumber || null,
        notes: formData.notes || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Funding source added successfully");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        sourceName: "",
        sourceType: "bank_loan",
        principalAmount: "",
        interestType: "percentage",
        interestRate: "",
        fixedInterestAmount: "",
        tenureMonths: "",
        fundReceivedDate: new Date().toISOString().split("T")[0],
        emiStartDate: new Date().toISOString().split("T")[0],
        status: "active",
        bankName: "",
        accountNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding funding source:", error);
      toast.error("Failed to add funding source");
    } finally {
      setLoading(false);
    }
  };

  const isBankLoan = formData.sourceType === "bank_loan";
  const isPersonalLoan = formData.sourceType === "personal_loan";
  const needsInterest = isBankLoan || isPersonalLoan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Funding Source</DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new funding source to track your finances
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Name */}
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

          {/* Source Type */}
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
                <SelectItem value="personal_loan">
                  Personal Loan (Known Person)
                </SelectItem>
                <SelectItem value="personal_contribution">
                  Personal Contribution
                </SelectItem>
                <SelectItem value="family_support">Family Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Principal Amount */}
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
            {formData.principalAmount &&
              parseFloat(formData.principalAmount) > 0 && (
                <p className="text-xs text-emerald-400 mt-1">
                  {numberToIndianWords(formData.principalAmount)}
                </p>
              )}
          </div>

          {/* Loan specific fields (Bank or Personal) */}
          {needsInterest && (
            <>
              {/* Tenure */}
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

              {/* Interest Type */}
              <div className="space-y-2">
                <Label htmlFor="interestType">Interest Type</Label>
                <Select
                  value={formData.interestType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, interestType: value })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="percentage">
                      Percentage (% p.a.)
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      Fixed Amount (Monthly)
                    </SelectItem>
                    <SelectItem value="none">No Interest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {formData.interestType === "percentage" &&
                    "Standard EMI with interest rate"}
                  {formData.interestType === "fixed_amount" &&
                    "Pay fixed interest monthly, principal at end"}
                  {formData.interestType === "none" && "Interest-free loan"}
                </p>
              </div>

              {/* Interest Rate (Percentage) */}
              {formData.interestType === "percentage" && (
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
              )}

              {/* Fixed Interest Amount */}
              {formData.interestType === "fixed_amount" && (
                <div className="space-y-2">
                  <Label htmlFor="fixedInterestAmount">
                    Fixed Monthly Interest (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fixedInterestAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 200 or 500"
                    value={formData.fixedInterestAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fixedInterestAmount: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                  {formData.fixedInterestAmount &&
                    parseFloat(formData.fixedInterestAmount) > 0 && (
                      <p className="text-xs text-emerald-400 mt-1">
                        {numberToIndianWords(formData.fixedInterestAmount)}
                      </p>
                    )}
                  <p className="text-xs text-slate-400">
                    Principal amount will be paid at the end of tenure.
                  </p>
                </div>
              )}

              {/* Bank Name (for bank loans) */}
              {isBankLoan && (
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
              )}

              {/* Account Number (for bank loans) */}
              {isBankLoan && (
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="e.g., XXXXXXXXX1234"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Fund Received Date */}
            <div className="space-y-2">
              <Label htmlFor="fundReceivedDate">Fund Received Date</Label>
              <Input
                id="fundReceivedDate"
                type="date"
                value={formData.fundReceivedDate}
                onChange={(e) =>
                  setFormData({ ...formData, fundReceivedDate: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* EMI Start Date */}
            <div className="space-y-2">
              <Label htmlFor="emiStartDate">EMI Start Date</Label>
              <Input
                id="emiStartDate"
                type="date"
                value={formData.emiStartDate}
                onChange={(e) =>
                  setFormData({ ...formData, emiStartDate: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Status */}
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

          {/* Notes */}
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
              {loading ? "Adding..." : "Add Funding Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
