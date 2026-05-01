"use client";

import { useState, useEffect } from "react";
import { useBorrowStore } from "@/lib/store/borrowStore";
import { usePaymentStore } from "@/lib/store/paymentStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  TrendingUp,
  Wallet,
  ArrowUpCircle,
  Plus,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/emiCalculator";

export default function DashboardPage() {
  const router = useRouter();
  const { borrows, loadBorrows, getTotalFunding, loading: borrowsLoading } = useBorrowStore();
  const { payments, loadPayments, getTotalPayments, loading: paymentsLoading } = usePaymentStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadBorrows(), loadPayments()]);
      setInitialized(true);
    };
    loadData();
  }, [loadBorrows, loadPayments]);

  const totalFunding = getTotalFunding();
  const totalExpenses = getTotalPayments();
  const netPosition = totalFunding - totalExpenses;
  const loading = !initialized || borrowsLoading || paymentsLoading;

  if (loading && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Overview of your home buying financial journey
        </p>
      </div>

      {/* Purchase Progress Card */}
      {totalFunding > 0 && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              Property Purchase Progress
            </CardTitle>
            <CardDescription className="text-slate-300">
              Track your payment completion status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  Total Funding Arranged
                </span>
                <span className="text-lg font-semibold text-blue-400">
                  {formatCurrency(totalFunding)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Amount Paid</span>
                <span className="text-lg font-semibold text-emerald-400">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                <span className="text-sm font-semibold text-white">
                  Remaining Balance
                </span>
                <span
                  className={`text-lg font-bold ${
                    netPosition >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(Math.abs(netPosition))}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {totalFunding > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Payment Progress</span>
                  <span className="text-white font-semibold">
                    {Math.min(100, Math.round((totalExpenses / totalFunding) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (totalExpenses / totalFunding) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Funding
            </CardTitle>
            <Wallet className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center">
              <IndianRupee className="h-5 w-5" />
              <span>
                {totalFunding > 0
                  ? formatCurrency(totalFunding).replace("₹", "")
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {borrows.length > 0
                ? `From ${borrows.length} source${borrows.length > 1 ? "s" : ""}`
                : "No funding sources yet"}
            </p>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/funding-sources")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funding Source
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Payments
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center">
              <IndianRupee className="h-5 w-5" />
              <span>
                {totalExpenses > 0
                  ? formatCurrency(totalExpenses).replace("₹", "")
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {payments.length > 0
                ? `${payments.length} payment${payments.length > 1 ? "s" : ""} recorded`
                : "No payments recorded"}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/dashboard/outgoing-payments")}
              className="mt-4 border-slate-700 text-white hover:bg-slate-800 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Net Position
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold flex items-center ${
                netPosition >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              <IndianRupee className="h-5 w-5" />
              <span>
                {netPosition !== 0
                  ? formatCurrency(Math.abs(netPosition)).replace("₹", "")
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Funded - Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Getting Started</CardTitle>
          <CardDescription className="text-slate-300">
            Follow these steps to set up your home buying financial tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">
                  Add Your Funding Sources
                </h4>
                <p className="text-sm text-slate-400">
                  Start by adding your home loans, personal contributions, or
                  other funding sources
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">
                  Track Your Payments
                </h4>
                <p className="text-sm text-slate-400">
                  Record EMI payments and payments like builder payments,
                  registration fees, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Monitor & Analyze</h4>
                <p className="text-sm text-slate-400">
                  Use analytics and reports to understand your financial
                  position and interest breakdown
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => router.push("/dashboard/funding-sources")}
          className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer"
        >
          <CardContent className="pt-6">
            <Home className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">Funding Sources</h3>
            <p className="text-xs text-slate-400">
              Manage your loans and contributions
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/incoming-payments")}
          className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer"
        >
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-emerald-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">EMI Tracking</h3>
            <p className="text-xs text-slate-400">
              Track and manage EMI payments
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/outgoing-payments")}
          className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer"
        >
          <CardContent className="pt-6">
            <ArrowUpCircle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">Payments</h3>
            <p className="text-xs text-slate-400">
              Record all outgoing payments
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/analytics")}
          className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer"
        >
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">Analytics</h3>
            <p className="text-xs text-slate-400">
              View detailed insights and reports
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
