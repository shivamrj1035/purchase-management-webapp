"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import Cookies from "js-cookie";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if auth token exists in cookie
    const token = Cookies.get("auth-token");
    if (token) {
      setIsLoading(false);
    } else if (!isAuthenticated) {
      // Only redirect if both token and isAuthenticated are false
      // This prevents redirect during Zustand rehydration
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return null;
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
