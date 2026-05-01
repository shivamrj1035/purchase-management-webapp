import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Purchase Management System",
  description: "Track your purchases, borrowings, EMIs, and finances — all stored safely in your own Google Spreadsheet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#0f172a",
          colorInputBackground: "#1e293b",
          colorInputText: "#f8fafc",
        },
        elements: {
          formButtonPrimary:
            "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
          card: "bg-slate-900 border border-slate-800 shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton:
            "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
          formFieldLabel: "text-slate-300",
          formFieldInput:
            "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500",
          footerActionLink: "text-blue-400 hover:text-blue-300",
          identityPreviewEditButton: "text-blue-400",
          userButtonPopoverCard: "bg-slate-900 border-slate-800",
          userButtonPopoverActionButton: "text-slate-300 hover:bg-slate-800",
          userButtonPopoverActionButtonText: "text-slate-300",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${inter.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
