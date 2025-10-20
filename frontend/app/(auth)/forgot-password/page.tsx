"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Home, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !email.trim()) {
      toast.error("Error", {
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    console.log("🔐 Starting password reset for:", email);

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      console.log(
        "📧 Sending password reset email with settings:",
        actionCodeSettings
      );
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log("✅ Password reset email sent successfully!");

      setEmailSent(true);
      toast.success("Password reset email sent!", {
        description: "Check your inbox for reset instructions",
      });
    } catch (error: any) {
      console.error("❌ Password reset error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to send reset email. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === "auth/missing-continue-uri") {
        errorMessage = "Configuration error. Please contact support.";
        console.error("💡 Fix: Add authorized domains in Firebase Console");
      } else if (error.code === "auth/invalid-continue-uri") {
        errorMessage = "Configuration error. Please contact support.";
        console.error("💡 Fix: Check the action URL format");
      } else if (error.code === "auth/unauthorized-continue-uri") {
        errorMessage = "Configuration error. Please contact support.";
        console.error(
          "💡 Fix: Add this domain to authorized domains in Firebase"
        );
      }

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Logo/Header */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition"
        >
          <Home className="h-6 w-6" />
          <span className="text-xl font-bold">Property Purchase Manager</span>
        </Link>
      </div>

      {/* Forgot Password Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
          <CardDescription className="text-slate-400">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email to receive password reset instructions"}
          </CardDescription>
        </CardHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Link href="/login" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </form>
        ) : (
          <>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Email Sent!
                  </h3>
                  <p className="text-sm text-slate-400">
                    We've sent password reset instructions to
                  </p>
                  <p className="text-sm font-semibold text-blue-400">{email}</p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-300 font-medium">
                  Next Steps:
                </p>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>

              <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-amber-300 font-medium">
                  ⚠️ Email not received?
                </p>
                <ul className="text-xs text-amber-400/80 space-y-1 list-disc list-inside">
                  <li>Check your spam/junk folder</li>
                  <li>Wait 2-3 minutes (emails can be delayed)</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Verify your email is registered</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full border-slate-700 text-white hover:bg-slate-800"
              >
                Send Another Email
              </Button>
              <Link href="/login" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Created By Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <p className="text-sm text-blue-400 text-center">
            Created By <strong className="text-blue-300">Shivam Jayswal</strong>
          </p>
        </CardContent>
      </Card>

      {/* Development Debug Info */}
      {isDev && (
        <Card className="bg-purple-900/20 border-purple-800/50">
          <CardContent className="py-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-purple-300 mb-2">
                👨‍💻 Development Mode - Debug Info
              </p>
              <div className="text-xs text-purple-400/80 space-y-1">
                <p>• Open browser console (F12) to see detailed logs</p>
                <p>• Email must be registered in Firebase Authentication</p>
                <p>• Check spam folder if email not received</p>
                <p>
                  • Firebase Project:{" "}
                  <span className="text-purple-300">
                    {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
                  </span>
                </p>
                <p className="pt-2 text-purple-300/60">
                  See{" "}
                  <a
                    href="https://github.com/yourusername/yourrepo/blob/main/FORGOT-PASSWORD-DEBUG.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-purple-200"
                  >
                    FORGOT-PASSWORD-DEBUG.md
                  </a>{" "}
                  for troubleshooting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
