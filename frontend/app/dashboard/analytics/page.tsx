"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import { usePropertyStore } from "@/lib/store/propertyStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CenteredLoader } from "@/components/ui/loader";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  Home,
  IndianRupee,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  generateAmortizationSchedule,
} from "@/lib/utils/emiCalculator";
import { ConfigurationAlert } from "@/components/shared/ConfigurationAlert";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const { propertyDetails, loadPropertyDetails, getTotalCost } =
    usePropertyStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalFunding: 0,
    totalEMI: 0,
    totalInterest: 0,
    totalOutgoing: 0,
    totalPaid: 0,
    totalPending: 0,
    netPosition: 0,
    fundingByType: {} as Record<string, number>,
    expensesByCategory: {} as Record<string, number>,
    loanCount: 0,
    contributionCount: 0,
  });

  // Load property details on mount
  useEffect(() => {
    if (user?.userId) {
      loadPropertyDetails(user.userId);
    }
  }, [user?.userId, loadPropertyDetails]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userId = user?.userId || "dev-user";

      try {
        setLoading(true);

        // Fetch funding sources
        const fundingRef = collection(db, "users", userId, "fundingSources");
        const fundingSnapshot = await getDocs(fundingRef);
        let totalFunding = 0;
        let totalEMI = 0;
        let totalInterest = 0;
        let loanCount = 0;
        let contributionCount = 0;
        const fundingByType: Record<string, number> = {};

        fundingSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const principal = data.principalAmount || 0;
          totalFunding += principal;

          // Count loans vs contributions
          if (
            data.sourceType === "bank_loan" ||
            data.sourceType === "personal_loan"
          ) {
            loanCount++;
            if (data.status === "active") {
              totalEMI += data.emiAmount || 0;
            }
            // Calculate interest
            if (data.interestRate > 0) {
              const schedule = generateAmortizationSchedule(
                principal,
                data.interestRate,
                data.tenureMonths || 0,
                data.startDate?.toDate() || new Date()
              );
              totalInterest += schedule.totalInterest;
            }
          } else {
            contributionCount++;
          }

          fundingByType[data.sourceType] =
            (fundingByType[data.sourceType] || 0) + principal;
        });

        // Fetch outgoing payments
        const outgoingRef = collection(db, "users", userId, "outgoingPayments");
        const outgoingSnapshot = await getDocs(outgoingRef);
        let totalOutgoing = 0;
        let totalPaid = 0;
        let totalPending = 0;
        const expensesByCategory: Record<string, number> = {};

        outgoingSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const amount = data.amount || 0;
          totalOutgoing += amount;
          if (data.status === "paid") {
            totalPaid += amount;
          } else {
            totalPending += amount;
          }
          expensesByCategory[data.category] =
            (expensesByCategory[data.category] || 0) + amount;
        });

        setAnalytics({
          totalFunding,
          totalEMI,
          totalInterest,
          totalOutgoing,
          totalPaid,
          totalPending,
          netPosition: totalFunding - totalOutgoing,
          fundingByType,
          expensesByCategory,
          loanCount,
          contributionCount,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Calculate derived metrics
  const totalPropertyCost = getTotalCost();
  const purchasePrice = propertyDetails?.purchasePrice || 0;
  const fundingProgress =
    purchasePrice > 0 ? (analytics.totalFunding / purchasePrice) * 100 : 0;
  const paymentProgress =
    purchasePrice > 0 ? (analytics.totalPaid / purchasePrice) * 100 : 0;
  const totalRepaymentAmount = analytics.totalFunding + analytics.totalInterest;
  const debtToPropertyRatio =
    purchasePrice > 0 ? (analytics.totalFunding / purchasePrice) * 100 : 0;

  const categoryLabels: Record<string, string> = {
    bank_loan: "Bank Loan",
    personal_loan: "Personal Loan",
    personal_contribution: "Personal Contribution",
    family_support: "Family Support",
    other: "Other",
    builder_payment: "Builder Payment",
    registration: "Registration Fees",
    legal_fees: "Legal Fees",
    stamp_duty: "Stamp Duty",
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <CenteredLoader message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Configuration Alert */}
      <ConfigurationAlert />

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Financial Analytics
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-1">
          Detailed insights into your property purchase journey
        </p>
      </div>

      {/* Property Purchase Analysis - Enhanced Section */}
      {propertyDetails && propertyDetails.purchasePrice > 0 && (
        <>
          {/* Property Overview Card */}
          <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Purchase Analysis
              </CardTitle>
              <CardDescription className="text-slate-300">
                Comprehensive breakdown of your property investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Main Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs md:text-sm mb-2">
                    <Target className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Purchase Price</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">
                    {formatCurrency(purchasePrice)}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 text-xs md:text-sm mb-2">
                    <Wallet className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Funding Arranged</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-blue-400 break-words">
                    {formatCurrency(analytics.totalFunding)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {fundingProgress.toFixed(1)}% of target
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs md:text-sm mb-2">
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Amount Paid</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-emerald-400 break-words">
                    {formatCurrency(analytics.totalPaid)}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">
                    {paymentProgress.toFixed(1)}% completed
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 text-xs md:text-sm mb-2">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Remaining</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-amber-400 break-words">
                    {formatCurrency(
                      Math.max(0, purchasePrice - analytics.totalFunding)
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">to arrange</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-300 font-medium">
                      Funding Completion
                    </span>
                    <span className="text-blue-400 font-bold">
                      {fundingProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 h-3 transition-all duration-500"
                      style={{ width: `${Math.min(100, fundingProgress)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-300 font-medium">
                      Payment Completion
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {paymentProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 transition-all duration-500"
                      style={{ width: `${Math.min(100, paymentProgress)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Financial Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Loan Analysis */}
            <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg">
                  Loan Analysis
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Interest & repayment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Total Principal (Loans)
                  </span>
                  <span className="text-base md:text-lg font-bold text-white break-words">
                    {formatCurrency(
                      analytics.totalFunding -
                        Object.entries(analytics.fundingByType)
                          .filter(
                            ([type]) =>
                              type !== "bank_loan" && type !== "personal_loan"
                          )
                          .reduce((sum, [, amt]) => sum + amt, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Total Interest
                  </span>
                  <span className="text-base md:text-lg font-bold text-rose-400 break-words">
                    {formatCurrency(analytics.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs md:text-sm font-semibold text-white">
                    Total Repayment
                  </span>
                  <span className="text-lg md:text-xl font-bold text-orange-400 break-words">
                    {formatCurrency(totalRepaymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Active Loans
                  </span>
                  <span className="text-base md:text-lg font-bold text-cyan-400">
                    {analytics.loanCount}
                  </span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded p-3 mt-2">
                  <p className="text-xs text-rose-300 text-center">
                    Interest:{" "}
                    {analytics.totalFunding > 0
                      ? (
                          (analytics.totalInterest / analytics.totalFunding) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of principal
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg">
                  Payment Status
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Breakdown of payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Paid
                  </span>
                  <span className="text-base md:text-lg font-bold text-emerald-400 break-words">
                    {formatCurrency(analytics.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Pending
                  </span>
                  <span className="text-base md:text-lg font-bold text-amber-400 break-words">
                    {formatCurrency(analytics.totalPending)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs md:text-sm font-semibold text-white">
                    Total Payments
                  </span>
                  <span className="text-lg md:text-xl font-bold text-red-400 break-words">
                    {formatCurrency(analytics.totalOutgoing)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Completion
                  </span>
                  <span className="text-base md:text-lg font-bold text-cyan-400">
                    {analytics.totalOutgoing > 0
                      ? (
                          (analytics.totalPaid / analytics.totalOutgoing) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 mt-2">
                  <p className="text-xs text-emerald-300 text-center">
                    {formatCurrency(analytics.totalPaid)} of{" "}
                    {formatCurrency(analytics.totalOutgoing)} paid
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Cost Breakdown */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg">
                  Cost Breakdown
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  All property-related costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Purchase Price
                  </span>
                  <span className="text-base md:text-lg font-bold text-white break-words">
                    {formatCurrency(purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Registration
                  </span>
                  <span className="text-base md:text-lg font-bold text-violet-400 break-words">
                    {formatCurrency(propertyDetails?.registrationFees || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Stamp Duty
                  </span>
                  <span className="text-base md:text-lg font-bold text-purple-400 break-words">
                    {formatCurrency(propertyDetails?.stampDuty || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-slate-400">
                    Legal Fees
                  </span>
                  <span className="text-base md:text-lg font-bold text-pink-400 break-words">
                    {formatCurrency(propertyDetails?.legalFees || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-xs md:text-sm font-semibold text-white">
                    Total Cost
                  </span>
                  <span className="text-lg md:text-xl font-bold text-violet-400 break-words">
                    {formatCurrency(totalPropertyCost)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Financial Ratios */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">
                Financial Health Indicators
              </CardTitle>
              <CardDescription>
                Key metrics for your property purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-slate-400 mb-2">
                    Debt-to-Property Ratio
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-cyan-400">
                    {debtToPropertyRatio.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    of property value
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-slate-400 mb-2">
                    Net Available
                  </p>
                  <p
                    className={`text-2xl md:text-3xl font-bold break-words ${
                      analytics.netPosition >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(analytics.netPosition)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">current balance</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-slate-400 mb-2">
                    Monthly EMI
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-400 break-words">
                    {formatCurrency(analytics.totalEMI)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    total commitment
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-slate-400 mb-2">
                    Funding Sources
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-400">
                    {analytics.loanCount + analytics.contributionCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {analytics.loanCount} loans, {analytics.contributionCount}{" "}
                    contributions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-500 break-words">
              {formatCurrency(analytics.totalFunding)}
            </div>
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
            <div className="text-xl md:text-2xl font-bold text-amber-500 break-words">
              {formatCurrency(analytics.totalEMI)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-500 break-words">
              {formatCurrency(analytics.totalOutgoing)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Net Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl md:text-2xl font-bold break-words ${
                analytics.netPosition >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {formatCurrency(analytics.netPosition)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base md:text-lg">
              Funding Sources Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs md:text-sm">
              By source type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : Object.keys(analytics.fundingByType).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No funding sources yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.fundingByType).map(
                  ([type, amount]) => {
                    return (
                      <div
                        key={type}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <span className="text-slate-300 text-sm md:text-base">
                          {categoryLabels[type] || type}
                        </span>
                        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                          <div className="w-full sm:w-32 md:w-48 bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (amount / analytics.totalFunding) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-semibold text-sm md:text-base w-24 md:w-32 text-right break-words">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base md:text-lg">
              Payments Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs md:text-sm">
              By category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : Object.keys(analytics.expensesByCategory).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No payments recorded yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.expensesByCategory).map(
                  ([category, amount]) => {
                    return (
                      <div
                        key={category}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <span className="text-slate-300 text-sm md:text-base">
                          {categoryLabels[category] || category}
                        </span>
                        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                          <div className="w-full sm:w-32 md:w-48 bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (amount / analytics.totalOutgoing) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-semibold text-sm md:text-base w-24 md:w-32 text-right break-words">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base md:text-lg">
            Financial Summary
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs md:text-sm">
            Overall financial position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300 text-sm md:text-base">
                Total Funding Received
              </span>
              <span className="text-lg md:text-xl font-bold text-blue-500 break-words">
                {formatCurrency(analytics.totalFunding)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300 text-sm md:text-base">
                Total Payments (Paid + Pending)
              </span>
              <span className="text-lg md:text-xl font-bold text-red-500 break-words">
                {formatCurrency(analytics.totalOutgoing)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300 text-sm md:text-base">
                Amount Paid
              </span>
              <span className="text-lg md:text-xl font-bold text-emerald-500 break-words">
                {formatCurrency(analytics.totalPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg border-2 border-blue-500">
              <span className="text-white font-semibold text-sm md:text-base">
                Available Balance
              </span>
              <span
                className={`text-xl md:text-2xl font-bold break-words ${
                  analytics.netPosition >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(analytics.netPosition)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300 text-sm md:text-base">
                Monthly EMI Commitment
              </span>
              <span className="text-lg md:text-xl font-bold text-amber-500 break-words">
                {formatCurrency(analytics.totalEMI)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
