"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/emiCalculator";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFunding: 0,
    totalExpenses: 0,
    netPosition: 0,
    purchasePrice: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const userId = user?.userId || "dev-user";

      try {
        // Fetch property purchase price
        let purchasePrice = 0;
        try {
          const propertyRef = doc(db, "users", userId, "settings", "property");
          const propertyDoc = await getDoc(propertyRef);
          if (propertyDoc.exists()) {
            purchasePrice = propertyDoc.data().purchasePrice || 0;
          }
        } catch (error) {
          console.log("No property details found");
        }
        // Fetch funding sources
        const fundingRef = collection(db, "users", userId, "fundingSources");
        const fundingSnapshot = await getDocs(fundingRef);
        const totalFunding = fundingSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().principalAmount || 0),
          0
        );

        // Fetch outgoing payments
        const outgoingRef = collection(db, "users", userId, "outgoingPayments");
        const outgoingSnapshot = await getDocs(outgoingRef);
        const totalExpenses = outgoingSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );

        setStats({
          totalFunding,
          totalExpenses,
          netPosition: totalFunding - totalExpenses,
          purchasePrice,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

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
      {stats.purchasePrice > 0 && (
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
                <span className="text-sm text-slate-400">Target Amount</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(stats.purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  Total Funding Arranged
                </span>
                <span className="text-lg font-semibold text-blue-400">
                  {formatCurrency(stats.totalFunding)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Amount Paid</span>
                <span className="text-lg font-semibold text-emerald-400">
                  {formatCurrency(stats.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                <span className="text-sm font-semibold text-white">
                  Remaining to Arrange
                </span>
                <span
                  className={`text-lg font-bold ${
                    stats.purchasePrice - stats.totalFunding > 0
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {formatCurrency(
                    Math.max(0, stats.purchasePrice - stats.totalFunding)
                  )}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Funding Progress</span>
                <span className="text-white font-semibold">
                  {Math.min(
                    100,
                    Math.round((stats.totalFunding / stats.purchasePrice) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.totalFunding / stats.purchasePrice) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Payment Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Progress</span>
                <span className="text-white font-semibold">
                  {Math.min(
                    100,
                    Math.round(
                      (stats.totalExpenses / stats.purchasePrice) * 100
                    )
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.totalExpenses / stats.purchasePrice) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {stats.totalFunding >= stats.purchasePrice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-emerald-400 font-semibold text-center">
                  🎉 Congratulations! You have arranged full funding for the
                  purchase!
                </p>
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
                {stats.totalFunding > 0
                  ? formatCurrency(stats.totalFunding).replace("₹", "")
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.totalFunding > 0
                ? "From all sources"
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
                {stats.totalExpenses > 0
                  ? formatCurrency(stats.totalExpenses).replace("₹", "")
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.totalExpenses > 0
                ? "Total paid + pending"
                : "No payments recorded"}
            </p>
            <Button
              size="sm"
              variant="outline"
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
                stats.netPosition >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              <IndianRupee className="h-5 w-5" />
              <span>
                {stats.netPosition !== 0
                  ? formatCurrency(Math.abs(stats.netPosition)).replace("₹", "")
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

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-emerald-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">EMI Tracking</h3>
            <p className="text-xs text-slate-400">
              Track and manage EMI payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer">
          <CardContent className="pt-6">
            <ArrowUpCircle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">Payments</h3>
            <p className="text-xs text-slate-400">
              Record all outgoing payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition cursor-pointer">
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
