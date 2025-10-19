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

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState({
    purchasePrice: 0,
    registrationAmount: 0,
    stampDuty: 0,
    legalFees: 0,
  });
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

  useEffect(() => {
    const fetchAnalytics = async () => {
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
  const totalPropertyCost =
    propertyDetails.purchasePrice +
    propertyDetails.registrationAmount +
    propertyDetails.stampDuty +
    propertyDetails.legalFees;
  const fundingProgress =
    propertyDetails.purchasePrice > 0
      ? (analytics.totalFunding / propertyDetails.purchasePrice) * 100
      : 0;
  const paymentProgress =
    propertyDetails.purchasePrice > 0
      ? (analytics.totalPaid / propertyDetails.purchasePrice) * 100
      : 0;
  const totalRepaymentAmount = analytics.totalFunding + analytics.totalInterest;
  const debtToPropertyRatio =
    propertyDetails.purchasePrice > 0
      ? (analytics.totalFunding / propertyDetails.purchasePrice) * 100
      : 0;

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Financial Analytics</h1>
        <p className="text-slate-400 mt-1">
          Detailed insights into your property purchase journey
        </p>
      </div>

      {/* Property Purchase Analysis - Enhanced Section */}
      {propertyDetails.purchasePrice > 0 && (
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
            <CardContent className="space-y-6">
              {/* Main Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm mb-2">
                    <Target className="h-4 w-4" />
                    <span>Purchase Price</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(propertyDetails.purchasePrice)}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                    <Wallet className="h-4 w-4" />
                    <span>Funding Arranged</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(analytics.totalFunding)}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {fundingProgress.toFixed(1)}% of target
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Amount Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(analytics.totalPaid)}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">
                    {paymentProgress.toFixed(1)}% completed
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">
                    {formatCurrency(
                      Math.max(
                        0,
                        propertyDetails.purchasePrice - analytics.totalFunding
                      )
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">to arrange</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
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
                  <div className="flex justify-between text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Analysis */}
            <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Loan Analysis
                </CardTitle>
                <CardDescription>Interest & repayment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Total Principal (Loans)
                  </span>
                  <span className="text-lg font-bold text-white">
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
                  <span className="text-sm text-slate-400">Total Interest</span>
                  <span className="text-lg font-bold text-rose-400">
                    {formatCurrency(analytics.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-sm font-semibold text-white">
                    Total Repayment
                  </span>
                  <span className="text-xl font-bold text-orange-400">
                    {formatCurrency(totalRepaymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Active Loans</span>
                  <span className="text-lg font-bold text-cyan-400">
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
                <CardTitle className="text-white text-lg">
                  Payment Status
                </CardTitle>
                <CardDescription>Breakdown of payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Paid</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {formatCurrency(analytics.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Pending</span>
                  <span className="text-lg font-bold text-amber-400">
                    {formatCurrency(analytics.totalPending)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-sm font-semibold text-white">
                    Total Payments
                  </span>
                  <span className="text-xl font-bold text-red-400">
                    {formatCurrency(analytics.totalOutgoing)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Completion</span>
                  <span className="text-lg font-bold text-cyan-400">
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
                <CardTitle className="text-white text-lg">
                  Cost Breakdown
                </CardTitle>
                <CardDescription>All property-related costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Purchase Price</span>
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(propertyDetails.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Registration</span>
                  <span className="text-lg font-bold text-violet-400">
                    {formatCurrency(propertyDetails.registrationAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Stamp Duty</span>
                  <span className="text-lg font-bold text-purple-400">
                    {formatCurrency(propertyDetails.stampDuty)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Legal Fees</span>
                  <span className="text-lg font-bold text-pink-400">
                    {formatCurrency(propertyDetails.legalFees)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="text-sm font-semibold text-white">
                    Total Cost
                  </span>
                  <span className="text-xl font-bold text-violet-400">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">
                    Debt-to-Property Ratio
                  </p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {debtToPropertyRatio.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    of property value
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Net Available</p>
                  <p
                    className={`text-3xl font-bold ${
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
                  <p className="text-sm text-slate-400 mb-2">Monthly EMI</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {formatCurrency(analytics.totalEMI)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    total commitment
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Funding Sources</p>
                  <p className="text-3xl font-bold text-blue-400">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
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
            <div className="text-2xl font-bold text-amber-500">
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
            <div className="text-2xl font-bold text-red-500">
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
              className={`text-2xl font-bold ${
                analytics.netPosition >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {formatCurrency(analytics.netPosition)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              Funding Sources Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400">
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
                  ([type, amount]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-slate-300">
                        {categoryLabels[type] || type}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (amount / analytics.totalFunding) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold w-32 text-right">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Payments Breakdown</CardTitle>
            <CardDescription className="text-slate-400">
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
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-slate-300">
                        {categoryLabels[category] || category}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (amount / analytics.totalOutgoing) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold w-32 text-right">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Financial Summary</CardTitle>
          <CardDescription className="text-slate-400">
            Overall financial position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Total Funding Received</span>
              <span className="text-xl font-bold text-blue-500">
                {formatCurrency(analytics.totalFunding)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">
                Total Payments (Paid + Pending)
              </span>
              <span className="text-xl font-bold text-red-500">
                {formatCurrency(analytics.totalOutgoing)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Amount Paid</span>
              <span className="text-xl font-bold text-emerald-500">
                {formatCurrency(analytics.totalPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border-2 border-blue-500">
              <span className="text-white font-semibold">
                Available Balance
              </span>
              <span
                className={`text-2xl font-bold ${
                  analytics.netPosition >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(analytics.netPosition)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Monthly EMI Commitment</span>
              <span className="text-xl font-bold text-amber-500">
                {formatCurrency(analytics.totalEMI)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
