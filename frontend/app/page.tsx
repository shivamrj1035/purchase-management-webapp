import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, TrendingUp, BarChart3, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Property Purchase Management System
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
            Track your home buying financial journey with ease. Manage funding
            sources, EMI payments, and payments all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 px-8"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Home className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-white">Funding Sources</CardTitle>
              <CardDescription className="text-slate-400">
                Track all loans and contributions in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle className="text-white">EMI Tracking</CardTitle>
              <CardDescription className="text-slate-400">
                Never miss a payment with automated reminders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle className="text-white">Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Comprehensive insights and detailed reports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-white">Reminders</CardTitle>
              <CardDescription className="text-slate-400">
                Email notifications for upcoming payments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Manage Your Home Purchase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Track Multiple Funding Sources
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Bank loans, personal contributions, and organization loans
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Automated EMI Calculations
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Generate complete amortization schedules instantly
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Expense Management
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Track builder payments, registration fees, and more
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Interest Analysis
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Detailed breakdown of principal vs interest payments
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Financial Reports
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Export data to CSV/PDF for record keeping
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Email Reminders
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Never miss a payment with customizable reminders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 max-w-3xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-slate-400 mb-8">
                Join thousands of users managing their home buying journey with
                ease
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-12"
                >
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>
            © 2024 Property Purchase Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
