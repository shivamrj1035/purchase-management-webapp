"use client";

import { useState, useEffect } from "react";
import { usePropertyStore } from "@/lib/store/propertyStore";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Edit,
  CheckCircle,
  IndianRupee,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/emiCalculator";
import PropertyConfigDialog from "@/components/property/PropertyConfigDialog";

export default function PurchaseConfigPage() {
  const { user } = useAuthStore();
  const { propertyDetails, loading, loadPropertyDetails, getTotalCost } =
    usePropertyStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load property details from Firebase on mount
  useEffect(() => {
    if (user?.userId) {
      loadPropertyDetails(user.userId);
    }
  }, [user?.userId, loadPropertyDetails]);

  const isConfigured = propertyDetails !== null;
  const totalCost = getTotalCost();

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading property configuration...</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Purchase Configuration
              </h1>
              <p className="text-sm md:text-base text-slate-400 mt-1">
                Configure your property purchase details and fees
              </p>
            </div>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {isConfigured ? "Edit Configuration" : "Set Up Configuration"}
              </span>
              <span className="sm:hidden">
                {isConfigured ? "Edit Config" : "Set Up Config"}
              </span>
            </Button>
          </div>

          {/* Not Configured Alert */}
          {!isConfigured && (
            <Card className="bg-amber-900/20 border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-200 mb-1">
                      Configuration Required
                    </h3>
                    <p className="text-sm text-amber-300 mb-3">
                      Set up your property purchase details to enable accurate
                      financial tracking across all sections. This includes
                      purchase price, registration fees, stamp duty, and other
                      costs.
                    </p>
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Configure Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Summary */}
          {isConfigured && (
            <>
              {/* Total Cost Card */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="h-6 w-6 mr-2 text-blue-400" />
                    Total Property Cost
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Complete purchase cost including all fees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">
                    {formatCurrency(totalCost)}
                  </div>
                  <p className="text-sm text-blue-300 mt-2">
                    This is your total property acquisition cost
                  </p>
                </CardContent>
              </Card>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Basic Details */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {propertyDetails.propertyAddress && (
                      <div>
                        <p className="text-sm text-slate-400">Address</p>
                        <p className="text-white font-medium">
                          {propertyDetails.propertyAddress}
                        </p>
                      </div>
                    )}
                    {propertyDetails.propertyType && (
                      <div>
                        <p className="text-sm text-slate-400">Property Type</p>
                        <p className="text-white font-medium">
                          {propertyDetails.propertyType}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-400">Purchase Price</p>
                      <p className="text-white font-medium flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {formatCurrency(propertyDetails.purchasePrice)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Fees Breakdown */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <IndianRupee className="h-5 w-5 mr-2" />
                      Fees & Charges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Registration Fees
                      </span>
                      <span className="text-white font-medium">
                        {formatCurrency(propertyDetails.registrationFees)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Stamp Duty</span>
                      <span className="text-white font-medium">
                        {formatCurrency(propertyDetails.stampDuty)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Legal Fees</span>
                      <span className="text-white font-medium">
                        {formatCurrency(propertyDetails.legalFees)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Brokerage Fees
                      </span>
                      <span className="text-white font-medium">
                        {formatCurrency(propertyDetails.brokerageFees)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Other Fees</span>
                      <span className="text-white font-medium">
                        {formatCurrency(propertyDetails.otherFees)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-300">
                          Total Fees
                        </span>
                        <span className="text-white font-bold">
                          {formatCurrency(
                            propertyDetails.registrationFees +
                              propertyDetails.stampDuty +
                              propertyDetails.legalFees +
                              propertyDetails.brokerageFees +
                              propertyDetails.otherFees
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Information */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                    How This Configuration is Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">
                          Dashboard Overview
                        </p>
                        <p className="text-slate-400">
                          Displays total property cost and tracks overall
                          financial progress
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">
                          Outgoing Payments
                        </p>
                        <p className="text-slate-400">
                          Calculates pending amount as: Total Cost - Payments
                          Made
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Analytics</p>
                        <p className="text-slate-400">
                          Generates reports and charts based on total property
                          cost
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">
                          Funding Progress
                        </p>
                        <p className="text-slate-400">
                          Compares total funding arranged vs. property cost
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Property Config Dialog */}
      <PropertyConfigDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
