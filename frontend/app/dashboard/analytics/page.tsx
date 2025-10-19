"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/emiCalculator";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalFunding: 0,
    totalEMI: 0,
    totalOutgoing: 0,
    totalPaid: 0,
    netPosition: 0,
    fundingByType: {} as Record<string, number>,
    expensesByCategory: {} as Record<string, number>,
  });

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
        const fundingByType: Record<string, number> = {};

        fundingSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          totalFunding += data.principalAmount || 0;
          if (data.sourceType === "bank_loan" && data.status === "active") {
            totalEMI += data.emiAmount || 0;
          }
          fundingByType[data.sourceType] =
            (fundingByType[data.sourceType] || 0) + (data.principalAmount || 0);
        });

        // Fetch outgoing payments
        const outgoingRef = collection(db, "users", userId, "outgoingPayments");
        const outgoingSnapshot = await getDocs(outgoingRef);
        let totalOutgoing = 0;
        let totalPaid = 0;
        const expensesByCategory: Record<string, number> = {};

        outgoingSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          totalOutgoing += data.amount || 0;
          if (data.status === "paid") {
            totalPaid += data.amount || 0;
          }
          expensesByCategory[data.category] =
            (expensesByCategory[data.category] || 0) + (data.amount || 0);
        });

        setAnalytics({
          totalFunding,
          totalEMI,
          totalOutgoing,
          totalPaid,
          netPosition: totalFunding - totalOutgoing,
          fundingByType,
          expensesByCategory,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const categoryLabels: Record<string, string> = {
    bank_loan: "Bank Loan",
    personal_contribution: "Personal Contribution",
    family_support: "Family Support",
    other: "Other",
    builder_payment: "Builder Payment",
    registration: "Registration Fees",
    legal_fees: "Legal Fees",
    stamp_duty: "Stamp Duty",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Financial insights and trends</p>
      </div>

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
              Total Expenses
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
            <CardTitle className="text-white">Expenses Breakdown</CardTitle>
            <CardDescription className="text-slate-400">
              By category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : Object.keys(analytics.expensesByCategory).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No expenses recorded yet
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
                Total Expenses (Paid + Pending)
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
