"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  FileText,
  Settings,
  Building2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Purchase Config",
    href: "/dashboard/purchase-config",
    icon: Building2,
  },
  {
    title: "Funding Sources",
    href: "/dashboard/funding-sources",
    icon: Wallet,
  },
  {
    title: "EMI Payments",
    href: "/dashboard/incoming-payments",
    icon: ArrowDownCircle,
  },
  {
    title: "Outgoing Payments",
    href: "/dashboard/outgoing-payments",
    icon: ArrowUpCircle,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-500">
              Property Purchase
            </h1>
            <p className="text-xs text-slate-500 mt-1">Management System</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 md:px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base",
                  isActive
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 md:p-4">
            <p className="text-xs font-semibold text-white mb-1">Need Help?</p>
            <p className="text-xs text-slate-400 break-words">
              Contact Shivam Jayswal (Developer) +91 9054401780
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
