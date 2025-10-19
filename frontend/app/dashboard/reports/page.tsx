"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Wallet,
  ArrowUpCircle,
  IndianRupee,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  generateAmortizationSchedule,
} from "@/lib/utils/emiCalculator";
import { toast } from "sonner";

interface FundingSource {
  id: string;
  sourceName: string;
  sourceType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: Date;
  status: string;
}

interface OutgoingPayment {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentDate: Date;
  status: string;
}

interface IncomingPayment {
  id: string;
  fundingSourceId: string;
  fundingSourceName: string;
  amount: number;
  paymentDate: Date;
  status: string;
  paymentType: string;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [outgoingPayments, setOutgoingPayments] = useState<OutgoingPayment[]>(
    []
  );
  const [incomingPayments, setIncomingPayments] = useState<IncomingPayment[]>(
    []
  );
  const [propertyDetails, setPropertyDetails] = useState({
    purchasePrice: 0,
    registrationAmount: 0,
    stampDuty: 0,
    legalFees: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.userId || "dev-user";

      try {
        setLoading(true);

        // Fetch property details
        try {
          const propertyRef = doc(db, "users", userId, "settings", "property");
          const propertyDoc = await getDoc(propertyRef);
          if (propertyDoc.exists()) {
            const data = propertyDoc.data();
            setPropertyDetails({
              purchasePrice: data.purchasePrice || 0,
              registrationAmount: data.registrationAmount || 0,
              stampDuty: data.stampDuty || 0,
              legalFees: data.legalFees || 0,
            });
          }
        } catch (error) {
          console.log("No property details found");
        }

        // Fetch funding sources
        const fundingRef = collection(db, "users", userId, "fundingSources");
        const fundingSnapshot = await getDocs(fundingRef);
        const funding = fundingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
        })) as FundingSource[];
        setFundingSources(funding);

        // Fetch outgoing payments
        const outgoingRef = collection(db, "users", userId, "outgoingPayments");
        const outgoingSnapshot = await getDocs(outgoingRef);
        const outgoing = outgoingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          paymentDate: doc.data().paymentDate?.toDate() || new Date(),
        })) as OutgoingPayment[];
        setOutgoingPayments(outgoing);

        // Fetch incoming payments
        const incomingRef = collection(db, "users", userId, "incomingPayments");
        const incomingSnapshot = await getDocs(incomingRef);
        const incoming = incomingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          paymentDate: doc.data().paymentDate?.toDate() || new Date(),
        })) as IncomingPayment[];
        setIncomingPayments(incoming);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate summary statistics
  const summary = {
    // Property Related
    purchasePrice: propertyDetails.purchasePrice,
    totalPropertyCosts:
      propertyDetails.purchasePrice +
      propertyDetails.registrationAmount +
      propertyDetails.stampDuty +
      propertyDetails.legalFees,
    // Funding Related
    totalFunding: fundingSources.reduce((sum, f) => sum + f.principalAmount, 0),
    totalEMI: fundingSources
      .filter((f) => f.status === "active")
      .reduce((sum, f) => sum + f.emiAmount, 0),
    totalInterest: fundingSources.reduce((sum, f) => {
      if (f.interestRate > 0) {
        const schedule = generateAmortizationSchedule(
          f.principalAmount,
          f.interestRate,
          f.tenureMonths,
          f.startDate
        );
        return sum + schedule.totalInterest;
      }
      return sum;
    }, 0),
    // Payments
    totalOutgoing: outgoingPayments.reduce((sum, p) => sum + p.amount, 0),
    totalPaid: outgoingPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    totalPending: outgoingPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  // Calculate progress percentages
  const fundingProgress =
    summary.purchasePrice > 0
      ? Math.min(100, (summary.totalFunding / summary.purchasePrice) * 100)
      : 0;
  const paymentProgress =
    summary.purchasePrice > 0
      ? Math.min(100, (summary.totalPaid / summary.purchasePrice) * 100)
      : 0;
  const remainingToArrange =
    summary.purchasePrice > 0
      ? Math.max(0, summary.purchasePrice - summary.totalFunding)
      : 0;

  // Export to CSV function
  const exportToCSV = (type: string) => {
    let csvContent = "";
    let filename = "";

    if (type === "funding") {
      csvContent =
        "Source Name,Type,Principal Amount,Interest Rate,Tenure (Months),EMI Amount,Start Date,Status\n";
      fundingSources.forEach((f) => {
        csvContent += `"${f.sourceName}","${f.sourceType}",${
          f.principalAmount
        },${f.interestRate},${f.tenureMonths},${f.emiAmount},"${formatDate(
          f.startDate
        )}","${f.status}"\n`;
      });
      filename = "funding-sources-report.csv";
    } else if (type === "outgoing") {
      csvContent = "Category,Description,Amount,Payment Date,Status\n";
      outgoingPayments.forEach((p) => {
        csvContent += `"${p.category}","${p.description}",${
          p.amount
        },"${formatDate(p.paymentDate)}","${p.status}"\n`;
      });
      filename = "outgoing-payments-report.csv";
    } else if (type === "incoming") {
      csvContent = "Funding Source,Amount,Payment Date,Status,Type\n";
      incomingPayments.forEach((p) => {
        csvContent += `"${p.fundingSourceName}",${p.amount},"${formatDate(
          p.paymentDate
        )}","${p.status}","${p.paymentType}"\n`;
      });
      filename = "incoming-payments-report.csv";
    } else if (type === "summary") {
      csvContent = "Metric,Amount\n";
      csvContent += `"Total Funding",${summary.totalFunding}\n`;
      csvContent += `"Total Interest",${summary.totalInterest}\n`;
      csvContent += `"Total Payments",${summary.totalOutgoing}\n`;
      csvContent += `"Amount Paid",${summary.totalPaid}\n`;
      csvContent += `"Amount Pending",${summary.totalPending}\n`;
      csvContent += `"Monthly EMI",${summary.totalEMI}\n`;
      csvContent += `"Available Balance",${
        summary.totalFunding - summary.totalOutgoing
      }\n`;
      filename = "financial-summary-report.csv";
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully!");
  };

  const categoryLabels: Record<string, string> = {
    bank_loan: "Bank Loan",
    personal_loan: "Personal Loan",
    personal_contribution: "Personal Contribution",
    family_support: "Family Support",
    organization_loan: "Organization Loan",
    other: "Other",
    builder_payment: "Builder Payment",
    registration: "Registration Fees",
    legal_fees: "Legal Fees",
    stamp_duty: "Stamp Duty",
    interior: "Interior Work",
    maintenance: "Maintenance",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">
            Comprehensive financial reports and data exports
          </p>
        </div>
        <Button
          onClick={() => exportToCSV("summary")}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
      </div>

      {/* Property Purchase Overview */}
      {summary.purchasePrice > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Property Purchase Overview
            </CardTitle>
            <CardDescription className="text-slate-300">
              Complete breakdown of your property purchase journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-xs text-slate-400 mb-1">Purchase Price</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(summary.purchasePrice)}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
                <p className="text-xs text-slate-400 mb-1">Funding Arranged</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(summary.totalFunding)}
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  {fundingProgress.toFixed(1)}% Complete
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/20">
                <p className="text-xs text-slate-400 mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(summary.totalPaid)}
                </p>
                <p className="text-xs text-cyan-400 mt-1">
                  {paymentProgress.toFixed(1)}% Completed
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/20">
                <p className="text-xs text-slate-400 mb-1">Remaining</p>
                <p className="text-2xl font-bold text-amber-400">
                  {formatCurrency(remainingToArrange)}
                </p>
                <p className="text-xs text-slate-400 mt-1">To Arrange</p>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">
                    Funding Progress
                  </span>
                  <span className="text-sm font-bold text-blue-400">
                    {fundingProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${fundingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>{formatCurrency(summary.totalFunding)}</span>
                  <span>{formatCurrency(summary.purchasePrice)}</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">
                    Payment Progress
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {paymentProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>{formatCurrency(summary.totalPaid)}</span>
                  <span>{formatCurrency(summary.purchasePrice)}</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-3">
                Financial Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Registration</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(propertyDetails.registrationAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Stamp Duty</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(propertyDetails.stampDuty)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Legal Fees</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(propertyDetails.legalFees)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Costs</p>
                  <p className="text-sm font-semibold text-purple-400">
                    {formatCurrency(summary.totalPropertyCosts)}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Status */}
            {fundingProgress >= 100 && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">🎉</span>
                  Congratulations! Full funding arranged for your property!
                  <span className="text-2xl">🎉</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(summary.totalFunding)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Principal from all sources
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(summary.totalInterest)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Interest over tenure</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(summary.totalOutgoing)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Paid + Pending</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <IndianRupee className="h-4 w-4 mr-2" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(summary.totalFunding - summary.totalOutgoing)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Funding - Payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="funding">Funding Sources</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing Payments</TabsTrigger>
          <TabsTrigger value="incoming">EMI Payments</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Financial Summary</CardTitle>
              <CardDescription>
                Complete overview of your financial position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                      Funding Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                        <span className="text-slate-300">Total Principal</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(summary.totalFunding)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                        <span className="text-slate-300">Total Interest</span>
                        <span className="font-semibold text-amber-400">
                          {formatCurrency(summary.totalInterest)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded border border-blue-500/30">
                        <span className="text-slate-300 font-semibold">
                          Total Repayment
                        </span>
                        <span className="font-bold text-blue-400">
                          {formatCurrency(
                            summary.totalFunding + summary.totalInterest
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                      Payments Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                        <span className="text-slate-300">Amount Paid</span>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(summary.totalPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                        <span className="text-slate-300">Amount Pending</span>
                        <span className="font-semibold text-amber-400">
                          {formatCurrency(summary.totalPending)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded border border-red-500/30">
                        <span className="text-slate-300 font-semibold">
                          Total Payments
                        </span>
                        <span className="font-bold text-red-400">
                          {formatCurrency(summary.totalOutgoing)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Monthly EMI Commitment
                      </h3>
                      <p className="text-sm text-slate-400">
                        Total monthly payment across all active loans
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                      {formatCurrency(summary.totalEMI)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funding Sources Tab */}
        <TabsContent value="funding">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Funding Sources Report
                </CardTitle>
                <CardDescription>
                  All funding sources with details
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV("funding")}
                variant="outline"
                className="border-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {fundingSources.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No funding sources found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">
                          Source Name
                        </TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">
                          Principal
                        </TableHead>
                        <TableHead className="text-slate-400">
                          Interest Rate
                        </TableHead>
                        <TableHead className="text-slate-400">Tenure</TableHead>
                        <TableHead className="text-slate-400">EMI</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundingSources.map((source) => (
                        <TableRow key={source.id} className="border-slate-800">
                          <TableCell className="text-white font-medium">
                            {source.sourceName}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {categoryLabels[source.sourceType] ||
                              source.sourceType}
                          </TableCell>
                          <TableCell className="text-blue-400 font-semibold">
                            {formatCurrency(source.principalAmount)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {source.interestRate}%
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {source.tenureMonths} months
                          </TableCell>
                          <TableCell className="text-amber-400 font-semibold">
                            {formatCurrency(source.emiAmount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                source.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-slate-700 text-slate-400"
                              }`}
                            >
                              {source.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outgoing Payments Tab */}
        <TabsContent value="outgoing">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Outgoing Payments Report
                </CardTitle>
                <CardDescription>
                  All payments and payments made
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV("outgoing")}
                variant="outline"
                className="border-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {outgoingPayments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No outgoing payments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">
                          Category
                        </TableHead>
                        <TableHead className="text-slate-400">
                          Description
                        </TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">
                          Payment Date
                        </TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outgoingPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-slate-800">
                          <TableCell className="text-slate-300">
                            {categoryLabels[payment.category] ||
                              payment.category}
                          </TableCell>
                          <TableCell className="text-white">
                            {payment.description}
                          </TableCell>
                          <TableCell className="text-red-400 font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                payment.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incoming Payments Tab */}
        <TabsContent value="incoming">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  EMI Payments Report
                </CardTitle>
                <CardDescription>All EMI and loan payments</CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV("incoming")}
                variant="outline"
                className="border-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {incomingPayments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No EMI payments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">
                          Funding Source
                        </TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">
                          Payment Date
                        </TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomingPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-slate-800">
                          <TableCell className="text-white font-medium">
                            {payment.fundingSourceName}
                          </TableCell>
                          <TableCell className="text-emerald-400 font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {payment.paymentType}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                payment.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
