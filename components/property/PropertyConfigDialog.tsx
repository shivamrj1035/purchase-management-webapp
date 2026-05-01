"use client";

import { useState, useEffect } from "react";
import { usePropertyStore } from "@/lib/store/propertyStore";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/emiCalculator";
import { IndianRupee, Calculator } from "lucide-react";
import { numberToIndianWords } from "@/lib/utils/numberToWords";

interface PropertyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PropertyConfigDialog({
  open,
  onOpenChange,
}: PropertyConfigDialogProps) {
  const { user } = useAuthStore();
  const { propertyDetails, setPropertyDetails } = usePropertyStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: propertyDetails?.propertyAddress || "",
    propertyType: propertyDetails?.propertyType || "residential",
    purchasePrice: propertyDetails?.purchasePrice.toString() || "",
    registrationFees: propertyDetails?.registrationFees.toString() || "0",
    stampDuty: propertyDetails?.stampDuty.toString() || "0",
    legalFees: propertyDetails?.legalFees.toString() || "0",
    brokerageFees: propertyDetails?.brokerageFees.toString() || "0",
    otherFees: propertyDetails?.otherFees.toString() || "0",
  });

  // Update form when propertyDetails changes
  useEffect(() => {
    if (propertyDetails) {
      setFormData({
        propertyAddress: propertyDetails.propertyAddress || "",
        propertyType: propertyDetails.propertyType || "residential",
        purchasePrice: propertyDetails.purchasePrice.toString(),
        registrationFees: propertyDetails.registrationFees.toString(),
        stampDuty: propertyDetails.stampDuty.toString(),
        legalFees: propertyDetails.legalFees.toString(),
        brokerageFees: propertyDetails.brokerageFees.toString(),
        otherFees: propertyDetails.otherFees.toString(),
      });
    }
  }, [propertyDetails]);

  // Calculate total cost in real-time
  const calculateTotal = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const registrationFees = parseFloat(formData.registrationFees) || 0;
    const stampDuty = parseFloat(formData.stampDuty) || 0;
    const legalFees = parseFloat(formData.legalFees) || 0;
    const brokerageFees = parseFloat(formData.brokerageFees) || 0;
    const otherFees = parseFloat(formData.otherFees) || 0;

    return (
      purchasePrice +
      registrationFees +
      stampDuty +
      legalFees +
      brokerageFees +
      otherFees
    );
  };

  const totalCost = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userId) {
      toast.error("Please log in to save property configuration");
      return;
    }

    setLoading(true);

    try {
      const purchasePrice = parseFloat(formData.purchasePrice);

      if (!purchasePrice || purchasePrice <= 0) {
        toast.error("Please enter a valid purchase price");
        setLoading(false);
        return;
      }

      await setPropertyDetails(
        {
          propertyAddress: formData.propertyAddress,
          propertyType: formData.propertyType,
          purchasePrice: purchasePrice,
          registrationFees: parseFloat(formData.registrationFees) || 0,
          stampDuty: parseFloat(formData.stampDuty) || 0,
          legalFees: parseFloat(formData.legalFees) || 0,
          brokerageFees: parseFloat(formData.brokerageFees) || 0,
          otherFees: parseFloat(formData.otherFees) || 0,
          totalCost: totalCost,
        }
      );

      toast.success("Property configuration saved to your account");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving property configuration:", error);
      toast.error("Failed to save configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Property Purchase Configuration
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure your property details and all associated fees
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Property Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Textarea
                id="propertyAddress"
                placeholder="Enter complete property address..."
                value={formData.propertyAddress}
                onChange={(e) =>
                  setFormData({ ...formData, propertyAddress: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, propertyType: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="plot">Plot/Land</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purchase Price */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Purchase Price
            </h3>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                Purchase Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                placeholder="e.g., 5000000"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
              {formData.purchasePrice && parseFloat(formData.purchasePrice) > 0 && (
                <p className="text-xs text-emerald-400 mt-1">
                  {numberToIndianWords(formData.purchasePrice)}
                </p>
              )}
            </div>
          </div>

          {/* Fees & Charges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Fees & Charges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationFees">Registration Fees (₹)</Label>
                <Input
                  id="registrationFees"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50000"
                  value={formData.registrationFees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationFees: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {formData.registrationFees && parseFloat(formData.registrationFees) > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {numberToIndianWords(formData.registrationFees)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stampDuty">Stamp Duty (₹)</Label>
                <Input
                  id="stampDuty"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 300000"
                  value={formData.stampDuty}
                  onChange={(e) =>
                    setFormData({ ...formData, stampDuty: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {formData.stampDuty && parseFloat(formData.stampDuty) > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {numberToIndianWords(formData.stampDuty)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalFees">Legal Fees (₹)</Label>
                <Input
                  id="legalFees"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 25000"
                  value={formData.legalFees}
                  onChange={(e) =>
                    setFormData({ ...formData, legalFees: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {formData.legalFees && parseFloat(formData.legalFees) > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {numberToIndianWords(formData.legalFees)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brokerageFees">Brokerage Fees (₹)</Label>
                <Input
                  id="brokerageFees"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100000"
                  value={formData.brokerageFees}
                  onChange={(e) =>
                    setFormData({ ...formData, brokerageFees: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {formData.brokerageFees && parseFloat(formData.brokerageFees) > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {numberToIndianWords(formData.brokerageFees)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherFees">Other Fees (₹)</Label>
                <Input
                  id="otherFees"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 15000"
                  value={formData.otherFees}
                  onChange={(e) =>
                    setFormData({ ...formData, otherFees: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {formData.otherFees && parseFloat(formData.otherFees) > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {numberToIndianWords(formData.otherFees)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total Cost Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/50 to-slate-800 border border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-400" />
                <span className="text-lg font-semibold text-white">
                  Total Property Cost
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-300 flex items-center">
                <IndianRupee className="h-6 w-6 mr-1" />
                {formatCurrency(totalCost)}
              </div>
            </div>
            <p className="text-xs text-blue-200 mt-2">
              This amount will be used across all sections for financial
              tracking
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
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
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyConfigDialog;
