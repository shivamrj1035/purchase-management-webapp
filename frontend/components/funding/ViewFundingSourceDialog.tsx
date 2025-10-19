"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  generateAmortizationSchedule,
} from "@/lib/utils/emiCalculator";
import { FundingSource } from "@/app/(dashboard)/funding-sources/page";
import {
  Calendar,
  TrendingUp,
  CreditCard,
  Building2,
  FileText,
  IndianRupee,
} from "lucide-react";

interface ViewFundingSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: FundingSource;
}

export default function ViewFundingSourceDialog({
  open,
  onOpenChange,
  source,
}: ViewFundingSourceDialogProps) {
  const isBankLoan = source.sourceType === "bank_loan";

  // Generate amortization schedule for bank loans
  const amortizationData = isBankLoan
    ? generateAmortizationSchedule(
        source.principalAmount,
        source.interestRate,
        source.tenureMonths,
        source.startDate
      )
    : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
      closed: "bg-slate-500/20 text-slate-400 border-slate-500/50",
      pending: "bg-amber-500/20 text-amber-500 border-amber-500/50",
    };
    return (
      colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/50"
    );
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bank_loan: "Bank Loan",
      personal_contribution: "Personal Contribution",
      family_support: "Family Support",
      other: "Other",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {source.sourceName}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                {getSourceTypeLabel(source.sourceType)}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(source.status)}>
              {source.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Principal Amount</p>
                  <p className="text-lg font-semibold text-white flex items-center mt-1">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {formatCurrency(source.principalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Start Date</p>
                  <p className="text-lg font-semibold text-white flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(source.startDate)}
                  </p>
                </div>
              </div>
              {source.notes && (
                <div className="pt-2">
                  <p className="text-sm text-slate-400">Notes</p>
                  <p className="text-sm text-white mt-1">{source.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Loan Details */}
          {isBankLoan && (
            <>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Loan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Interest Rate</p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {source.interestRate}% p.a.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Tenure</p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {source.tenureMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Monthly EMI</p>
                      <p className="text-lg font-semibold text-emerald-500 flex items-center mt-1">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {formatCurrency(source.emiAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Interest</p>
                      <p className="text-lg font-semibold text-amber-500 flex items-center mt-1">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {amortizationData &&
                          formatCurrency(amortizationData.totalInterest)}
                      </p>
                    </div>
                  </div>

                  {source.bankName && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Bank Name</p>
                          <p className="text-sm text-white mt-1 flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {source.bankName}
                          </p>
                        </div>
                        {source.accountNumber && (
                          <div>
                            <p className="text-sm text-slate-400">
                              Account Number
                            </p>
                            <p className="text-sm text-white mt-1">
                              {source.accountNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amortization Schedule */}
              {amortizationData && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Amortization Schedule
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      First 12 months EMI breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-slate-700 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-900 hover:bg-slate-900">
                            <TableHead className="text-slate-300">
                              Month
                            </TableHead>
                            <TableHead className="text-slate-300">
                              Payment Date
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              EMI Amount
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Principal
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Interest
                            </TableHead>
                            <TableHead className="text-slate-300 text-right">
                              Balance
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {amortizationData.amortizationSchedule
                            .slice(0, 12)
                            .map((row) => (
                              <TableRow
                                key={row.month}
                                className="border-slate-700 hover:bg-slate-800/50"
                              >
                                <TableCell className="font-medium text-white">
                                  {row.month}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {formatDate(row.paymentDate)}
                                </TableCell>
                                <TableCell className="text-right text-white">
                                  {formatCurrency(row.emiAmount)}
                                </TableCell>
                                <TableCell className="text-right text-emerald-400">
                                  {formatCurrency(row.principalPaid)}
                                </TableCell>
                                <TableCell className="text-right text-amber-400">
                                  {formatCurrency(row.interestPaid)}
                                </TableCell>
                                <TableCell className="text-right text-slate-300">
                                  {formatCurrency(row.principalBalance)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    {amortizationData.amortizationSchedule.length > 12 && (
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Showing first 12 months of{" "}
                        {amortizationData.amortizationSchedule.length} total
                        months
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Metadata */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>Created: {formatDate(source.createdAt)}</p>
            <p>Last Updated: {formatDate(source.updatedAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
