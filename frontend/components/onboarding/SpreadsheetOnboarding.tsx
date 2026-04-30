"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useSpreadsheetStore } from "@/lib/store/spreadsheetStore";
import {
  CheckCircle,
  Loader2,
  ExternalLink,
  Shield,
  AlertCircle,
  Copy,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const SERVICE_ACCOUNT_EMAIL = "sheets-formatter@excel-492318.iam.gserviceaccount.com";

type Step = "welcome" | "create" | "share" | "connect" | "done";

export function SpreadsheetOnboarding() {
  const { user } = useUser();
  const { saveConfig } = useSpreadsheetStore();
  const [step, setStep] = useState<Step>("welcome");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationResult, setValidationResult] = useState<{
    title?: string;
    spreadsheetId?: string;
  } | null>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
    toast.success("Email copied to clipboard!");
  };

  const validateAndConnect = async () => {
    if (!spreadsheetUrl.trim()) {
      setError("Please enter your spreadsheet URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sheets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsPermission) {
          setError(
            `Please share your spreadsheet with: ${data.serviceAccountEmail}`
          );
          setStep("share");
        } else {
          setError(data.error || "Validation failed");
        }
        return;
      }

      setValidationResult({
        title: data.title,
        spreadsheetId: data.spreadsheetId,
      });

      // Save config
      await saveConfig(
        spreadsheetUrl,
        data.spreadsheetId,
        user?.primaryEmailAddress?.emailAddress || ""
      );

      setStep("done");
      toast.success("Spreadsheet connected successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Welcome, {user?.firstName || "there"}!
                </h1>
                <p className="text-lg text-slate-400 max-w-md mx-auto">
                  Let&apos;s set up your personal data store. Your financial
                  data will be saved directly in your own Google Spreadsheet.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  {
                    icon: Shield,
                    title: "You Own Your Data",
                    desc: "Everything is stored in YOUR Google Sheet",
                  },
                  {
                    icon: FileSpreadsheet,
                    title: "Full Transparency",
                    desc: "Open your spreadsheet anytime to see raw data",
                  },
                  {
                    icon: CheckCircle,
                    title: "Easy Setup",
                    desc: "Just 3 simple steps to get started",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50"
                  >
                    <item.icon className="w-6 h-6 text-blue-400 mb-2" />
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("create")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Create Spreadsheet */}
          {step === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-blue-400 mb-4">
                  <span className="px-2 py-0.5 bg-blue-500/10 rounded-full text-xs font-medium">
                    Step 1 of 3
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Create a Google Spreadsheet
                </h2>
                <p className="text-slate-400">
                  Create a new Google Spreadsheet that will store all your data
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      Go to{" "}
                      <a
                        href="https://sheets.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                      >
                        Google Sheets
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-white text-sm">
                    Click{" "}
                    <span className="text-blue-400 font-medium">
                      &quot;+ Blank spreadsheet&quot;
                    </span>{" "}
                    to create a new one
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-white text-sm">
                    Name it something like{" "}
                    <span className="text-emerald-400 font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">
                      My Purchase Manager
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep("welcome")}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep("share")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                >
                  I&apos;ve created it
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Share with service account */}
          {step === "share" && (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-blue-400 mb-4">
                  <span className="px-2 py-0.5 bg-blue-500/10 rounded-full text-xs font-medium">
                    Step 2 of 3
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Share Your Spreadsheet
                </h2>
                <p className="text-slate-400">
                  Share it with our service account so we can read & write your
                  data
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-white text-sm">
                    In your spreadsheet, click the{" "}
                    <span className="text-emerald-400 font-medium">
                      &quot;Share&quot;
                    </span>{" "}
                    button (top-right)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-white text-sm">
                      Add this email as an{" "}
                      <span className="text-amber-400 font-medium">
                        Editor
                      </span>
                      :
                    </p>
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3">
                      <code className="text-xs text-blue-300 flex-1 break-all">
                        {SERVICE_ACCOUNT_EMAIL}
                      </code>
                      <button
                        onClick={copyEmail}
                        className="p-1.5 hover:bg-slate-700 rounded-md transition-colors shrink-0"
                        title="Copy email"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-white text-sm">
                    Click{" "}
                    <span className="text-emerald-400 font-medium">
                      &quot;Send&quot;
                    </span>{" "}
                    (uncheck &quot;notify people&quot; if you want)
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300/80">
                    <strong>Security note:</strong> This service account can
                    only access spreadsheets you explicitly share. It cannot
                    access any other Google data.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep("create")}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep("connect")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                >
                  I&apos;ve shared it
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Connect */}
          {step === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-blue-400 mb-4">
                  <span className="px-2 py-0.5 bg-blue-500/10 rounded-full text-xs font-medium">
                    Step 3 of 3
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connect Your Spreadsheet
                </h2>
                <p className="text-slate-400">
                  Paste the URL of your spreadsheet below
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="url"
                    value={spreadsheetUrl}
                    onChange={(e) => {
                      setSpreadsheetUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep("share")}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={validateAndConnect}
                  disabled={loading || !spreadsheetUrl.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Connect Spreadsheet
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  All Set! 🎉
                </h2>
                <p className="text-slate-400">
                  Your spreadsheet &quot;
                  <span className="text-emerald-400">
                    {validationResult?.title}
                  </span>
                  &quot; is connected.
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  We&apos;ve created Borrows, EMIs, Payments, and Details sheets
                  for you.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
