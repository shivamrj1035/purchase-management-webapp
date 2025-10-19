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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500">Housing Manager</h1>
        <p className="text-xs text-slate-500 mt-1">Financial Management</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs font-semibold text-white mb-1">Need Help?</p>
          <p className="text-xs text-slate-400">
            Check our documentation for guides and FAQs
          </p>
        </div>
      </div>
    </aside>
  );
}
