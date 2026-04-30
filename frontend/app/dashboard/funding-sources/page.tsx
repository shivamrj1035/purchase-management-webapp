"use client";

import { useState, useEffect } from "react";
import { useBorrowStore } from "@/lib/store/borrowStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CenteredLoader } from "@/components/ui/loader";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Wallet,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/emiCalculator";
import AddFundingSourceDialog from "@/components/funding/AddFundingSourceDialog";
import EditFundingSourceDialog from "@/components/funding/EditFundingSourceDialog";
import ViewFundingSourceDialog from "@/components/funding/ViewFundingSourceDialog";

export interface FundingSource {
  id: string;
  sourceName: string;
  sourceType:
    | "bank_loan"
    | "personal_loan"
    | "personal_contribution"
    | "family_support"
    | "other";
  principalAmount: number;
  interestType?: "percentage" | "fixed_amount" | "none";
  interestRate: number;
  fixedInterestAmount?: number;
  tenureMonths: number;
  emiAmount: number;
  fundReceivedDate: Date;
  emiStartDate: Date;
  status: "active" | "closed" | "pending";
  bankName?: string;
  lenderName?: string;
  accountNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to calculate next EMI date
function getNextEMIDate(emiStartDate: Date, monthsElapsed: number): Date {
  const nextDate = new Date(emiStartDate);
  nextDate.setMonth(nextDate.getMonth() + monthsElapsed);
  return nextDate;
}

// Helper function to get next EMI details
function getNextEMIDetails(source: FundingSource) {
  if (
    source.sourceType !== "bank_loan" &&
    source.sourceType !== "personal_loan"
  ) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

  const startDate = new Date(source.emiStartDate);
  startDate.setHours(0, 0, 0, 0);

  // Calculate months elapsed more accurately
  let monthsSinceStart = 0;
  const tempDate = new Date(startDate);

  while (tempDate < now) {
    tempDate.setMonth(tempDate.getMonth() + 1);
    if (tempDate <= now) {
      monthsSinceStart++;
    }
  }

  const nextEMIMonth = monthsSinceStart;

  if (nextEMIMonth >= source.tenureMonths) {
    return null; // Loan completed
  }

  const nextDueDate = getNextEMIDate(source.emiStartDate, nextEMIMonth);
  nextDueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil(
    (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let status: "upcoming" | "due_soon" | "overdue" = "upcoming";
  if (daysUntilDue < 0) {
    status = "overdue";
  } else if (daysUntilDue <= 7) {
    status = "due_soon";
  }

  return {
    amount: source.emiAmount,
    dueDate: nextDueDate,
    daysUntilDue,
    status,
    monthNumber: nextEMIMonth + 1,
  };
}

export default function FundingSourcesPage() {
  const { borrows, loading, loadBorrows, deleteBorrow } = useBorrowStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(null);

  useEffect(() => {
    loadBorrows();
  }, [loadBorrows]);

  // Map borrows from sheet format to FundingSource format
  const fundingSources: FundingSource[] = borrows.map((b) => ({
    id: b.id,
    sourceName: b.name,
    sourceType: (b.type as FundingSource["sourceType"]) || "bank_loan",
    principalAmount: b.principalAmount,
    interestType: (b.interestType as "percentage" | "fixed_amount" | "none") || "percentage",
    interestRate: b.interestRate,
    fixedInterestAmount: 0,
    tenureMonths: b.tenureMonths,
    emiAmount: b.emiAmount,
    fundReceivedDate: new Date(b.startDate || Date.now()),
    emiStartDate: new Date(b.startDate || Date.now()),
    status: (b.status as "active" | "closed" | "pending") || "active",
    bankName: b.bankName,
    lenderName: b.lenderName,
    accountNumber: b.accountNumber,
    notes: b.notes,
    createdAt: new Date(b.createdAt || Date.now()),
    updatedAt: new Date(b.updatedAt || Date.now()),
  }));

  const fetchFundingSources = () => loadBorrows();

  // Delete funding source
  const handleDelete = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this funding source?")) {
      return;
    }

    try {
      await deleteBorrow(sourceId);
      toast.success("Funding source deleted successfully");
    } catch (error) {
      console.error("Error deleting funding source:", error);
      toast.error("Failed to delete funding source");
    }
  };

  // Calculate totals
  const totalFunding = fundingSources.reduce(
    (sum, source) => sum + source.principalAmount,
    0
  );
  const totalEMI = fundingSources
    .filter((s) => s.sourceType === "bank_loan" && s.status === "active")
    .reduce((sum, source) => sum + source.emiAmount, 0);
  const activeSources = fundingSources.filter(
    (s) => s.status === "active"
  ).length;

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bank_loan: "Bank Loan",
      personal_loan: "Personal Loan",
      personal_contribution: "Personal Contribution",
      family_support: "Family Support",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "text-emerald-500",
      closed: "text-slate-400",
      pending: "text-amber-500",
    };
    return colors[status] || "text-slate-400";
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Funding Sources</h1>
          <p className="text-slate-400 mt-1">
            Manage your loans and contributions
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Funding Source
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalFunding)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {fundingSources.length} sources
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Monthly EMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalEMI)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active loans</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Active Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeSources}</div>
            <p className="text-xs text-slate-400 mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Sources List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">All Funding Sources</CardTitle>
          <CardDescription className="text-slate-400">
            View and manage your funding sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CenteredLoader message="Loading funding sources..." />
          ) : fundingSources.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No funding sources yet</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Funding Source
              </Button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 w-full">
              {fundingSources.map((source) => {
                const nextEMI = getNextEMIDetails(source);
                return (
                  <div
                    key={source.id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 md:p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors gap-3 w-full min-w-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <h3 className="text-base md:text-lg font-semibold text-white truncate">
                          {source.sourceName}
                        </h3>
                        <span
                          className={`text-xs font-medium uppercase flex-shrink-0 ${getStatusColor(
                            source.status
                          )}`}
                        >
                          {source.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-slate-400">
                        <span className="truncate">
                          {getSourceTypeLabel(source.sourceType)}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">
                          Principal: {formatCurrency(source.principalAmount)}
                        </span>
                        {(source.sourceType === "bank_loan" ||
                          source.sourceType === "personal_loan") && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">
                              EMI: {formatCurrency(source.emiAmount)}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span className="truncate">
                              {source.interestType === "percentage"
                                ? `${source.interestRate}% p.a.`
                                : source.interestType === "fixed_amount"
                                ? `₹${source.fixedInterestAmount}/month`
                                : "No Interest"}{" "}
                              for {source.tenureMonths} months
                            </span>
                          </>
                        )}
                      </div>
                      {source.bankName && (
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {source.bankName}
                        </div>
                      )}
                      {source.lenderName && (
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          Lender: {source.lenderName}
                        </div>
                      )}
                      {/* Next EMI Details */}
                      {nextEMI && source.status === "active" && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-400 flex-shrink-0" />
                              <span className="text-slate-300">Next EMI:</span>
                              <span className="font-semibold text-white truncate">
                                {formatCurrency(nextEMI.amount)}
                              </span>
                            </div>
                            <span className="text-slate-600 hidden sm:inline">
                              •
                            </span>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-blue-400 flex-shrink-0" />
                              <span className="text-slate-300">Due:</span>
                              <span className="font-semibold text-white truncate">
                                {formatDate(nextEMI.dueDate)}
                              </span>
                            </div>
                            <span className="text-slate-600 hidden sm:inline">
                              •
                            </span>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0 ${
                                nextEMI.status === "overdue"
                                  ? "bg-red-500/20 text-red-400"
                                  : nextEMI.status === "due_soon"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {nextEMI.status === "overdue" && (
                                <>
                                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs font-medium whitespace-nowrap">
                                    Overdue by {Math.abs(nextEMI.daysUntilDue)}{" "}
                                    days
                                  </span>
                                </>
                              )}
                              {nextEMI.status === "due_soon" && (
                                <>
                                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs font-medium whitespace-nowrap">
                                    Due in {nextEMI.daysUntilDue} days
                                  </span>
                                </>
                              )}
                              {nextEMI.status === "upcoming" && (
                                <span className="text-xs font-medium whitespace-nowrap">
                                  {nextEMI.daysUntilDue} days remaining
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSource(source);
                          setIsViewDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSource(source);
                          setIsEditDialogOpen(true);
                        }}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(source.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddFundingSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchFundingSources}
      />
      {selectedSource && (
        <>
          <EditFundingSourceDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            source={selectedSource}
            onSuccess={fetchFundingSources}
          />
          <ViewFundingSourceDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            source={selectedSource}
          />
        </>
      )}
    </div>
  );
}
