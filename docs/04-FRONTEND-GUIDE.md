# Frontend Development Guide

Complete guide for developing the Next.js frontend application with TypeScript and Tailwind CSS.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [Routing](#routing)
5. [Styling Guidelines](#styling-guidelines)
6. [Form Handling](#form-handling)
7. [Data Fetching](#data-fetching)
8. [Authentication Flow](#authentication-flow)

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/               # Dashboard route group (protected)
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Main dashboard
│   │   ├── funding-sources/
│   │   │   ├── page.tsx          # List all funding sources
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Funding source details
│   │   │   └── components/
│   │   │       ├── FundingSourceTable.tsx
│   │   │       ├── AddFundingSourceModal.tsx
│   │   │       └── AmortizationSchedule.tsx
│   │   ├── outgoing-payments/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   ├── interest-breakdown/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── globals.css              # Global styles
│   └── providers.tsx            # Context providers
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── MobileMenu.tsx
│   ├── dashboard/
│   │   ├── SummaryCard.tsx
│   │   ├── QuickActions.tsx
│   │   └── RecentActivity.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── clerk/
│   │   ├── auth.ts             # Auth helpers
│   ├── google-sheets/
│   │   ├── client.ts           # API client
│   │   ├── auth.ts             # Auth API calls
│   │   ├── funding.ts          # Funding API calls
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFundingSources.ts
│   │   └── ...
│   ├── store/
│   │   ├── authStore.ts        # Zustand auth store
│   │   ├── fundingStore.ts
│   │   └── ...
│   ├── utils/
│   │   ├── formatters.ts       # Number/date formatters
│   │   ├── validators.ts       # Validation helpers
│   │   └── calculations.ts     # Financial calculations
│   └── types/
│       ├── auth.ts
│       ├── funding.ts
│       └── ...
├── public/
│   ├── images/
│   └── icons/
└── styles/
    └── themes/
        └── dark.css
```

---

## Component Architecture

### Base Components (shadcn/ui)

All UI components are built using shadcn/ui for consistency and accessibility.

**Example: Button Component**

```typescript
// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Layout Components

**Sidebar Component**

```typescript
// components/layout/Sidebar.tsx
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
    </aside>
  );
}
```

**TopNav Component**

```typescript
// components/layout/TopNav.tsx
"use client";

import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">{user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

### Dashboard Components

**Summary Card Component**

```typescript
// components/dashboard/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: SummaryCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(value)}
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-400">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## State Management

Using Zustand for global state management.

**Auth Store Example**

```typescript
// lib/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
```

**Funding Store Example**

```typescript
// lib/store/fundingStore.ts
import { create } from "zustand";

interface FundingSource {
  id: string;
  sourceType: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  status: string;
}

interface FundingState {
  fundingSources: FundingSource[];
  selectedFunding: FundingSource | null;
  setFundingSources: (sources: FundingSource[]) => void;
  addFundingSource: (source: FundingSource) => void;
  updateFundingSource: (id: string, data: Partial<FundingSource>) => void;
  deleteFundingSource: (id: string) => void;
  setSelectedFunding: (source: FundingSource | null) => void;
}

export const useFundingStore = create<FundingState>((set) => ({
  fundingSources: [],
  selectedFunding: null,

  setFundingSources: (sources) => set({ fundingSources: sources }),

  addFundingSource: (source) =>
    set((state) => ({
      fundingSources: [...state.fundingSources, source],
    })),

  updateFundingSource: (id, data) =>
    set((state) => ({
      fundingSources: state.fundingSources.map((source) =>
        source.id === id ? { ...source, ...data } : source
      ),
    })),

  deleteFundingSource: (id) =>
    set((state) => ({
      fundingSources: state.fundingSources.filter((source) => source.id !== id),
    })),

  setSelectedFunding: (source) => set({ selectedFunding: source }),
}));
```

---

## Routing

Using Next.js 14 App Router with route groups for authentication and protected routes.

**Dashboard Layout (Protected)**

```typescript
// app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## Styling Guidelines

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Dark theme colors
        slate: {
          950: "#0F172A",
          900: "#1E293B",
          800: "#334155",
        },
        blue: {
          500: "#3B82F6",
        },
        emerald: {
          500: "#10B981",
        },
        amber: {
          500: "#F59E0B",
        },
        red: {
          500: "#EF4444",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    /* ... other CSS variables */
  }
}

body {
  @apply bg-slate-950 text-white;
}
```

---

## Form Handling

Using React Hook Form with Zod validation.

**Add Funding Source Form**

```typescript
// components/funding/AddFundingSourceModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fundingSourceSchema = z.object({
  sourceType: z.enum([
    "bank_loan",
    "personal_contribution",
    "organization_loan",
  ]),
  lenderName: z.string().min(1, "Lender name is required"),
  principalAmount: z.number().positive("Amount must be positive"),
  interestRate: z.number().min(0).max(30),
  tenureMonths: z.number().int().positive(),
  emiAmount: z.number().positive(),
  fundingDate: z.string(),
});

type FundingSourceFormValues = z.infer<typeof fundingSourceSchema>;

interface AddFundingSourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FundingSourceFormValues) => Promise<void>;
}

export function AddFundingSourceModal({
  open,
  onClose,
  onSubmit,
}: AddFundingSourceModalProps) {
  const form = useForm<FundingSourceFormValues>({
    resolver: zodResolver(fundingSourceSchema),
    defaultValues: {
      sourceType: "bank_loan",
      lenderName: "",
      principalAmount: 0,
      interestRate: 0,
      tenureMonths: 0,
      emiAmount: 0,
      fundingDate: new Date().toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (data: FundingSourceFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle>Add Funding Source</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_loan">Bank Loan</SelectItem>
                      <SelectItem value="personal_contribution">
                        Personal Contribution
                      </SelectItem>
                      <SelectItem value="organization_loan">
                        Organization Loan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lenderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HDFC Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add more fields */}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Funding Source</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Data Fetching

**Custom Hook for Funding Sources**

```typescript
// lib/hooks/useFundingSources.ts
import { useState, useEffect } from "use";
import { useFundingStore } from "@/lib/store/fundingStore";
import { getFundingSources } from "@/lib/api/funding";

export function useFundingSources() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fundingSources, setFundingSources } = useFundingStore();

  useEffect(() => {
    const fetchFundingSources = async () => {
      try {
        setLoading(true);
        const data = await getFundingSources();
        setFundingSources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFundingSources();
  }, [setFundingSources]);

  return { fundingSources, loading, error };
}
```

---

## Authentication Flow

**Protected Route Middleware**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

**Next:** [Deployment Guide](./05-DEPLOYMENT.md)
