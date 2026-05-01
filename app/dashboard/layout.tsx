"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { SpreadsheetOnboarding } from "@/components/onboarding/SpreadsheetOnboarding";
import { useSpreadsheetStore } from "@/lib/store/spreadsheetStore";
import { useAuthStore } from "@/lib/store/authStore";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { configured, loading: configLoading, loadConfig } = useSpreadsheetStore();
  const { setClerkUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      loadConfig();
      // Sync Clerk user to authStore for compatibility
      setClerkUser({
        id: clerkUser.id,
        emailAddresses: clerkUser.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      });
    }
  }, [isLoaded, isSignedIn, clerkUser, loadConfig, setClerkUser]);

  // Still loading auth state
  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Not signed in - Clerk middleware will redirect, but just in case
  if (!isSignedIn) {
    return null;
  }

  // Loading spreadsheet config
  if (configLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your configuration...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if spreadsheet not configured
  if (!configured) {
    return <SpreadsheetOnboarding />;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
