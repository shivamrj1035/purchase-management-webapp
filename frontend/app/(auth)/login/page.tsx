"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/store/authStore";
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
import { Home, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get Firebase ID token
      const token = await user.getIdToken();

      // Verify token with backend
      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          console.log("✅ Backend authentication verified:", data);
        } else {
          console.warn(
            "⚠️ Backend verification failed, continuing with frontend auth"
          );
        }
      } catch (backendError) {
        console.warn("⚠️ Backend not available:", backendError);
      }

      // Update auth store
      login(
        {
          userId: user.uid,
          email: user.email!,
          username: user.displayName || user.email!.split("@")[0],
          isEmailVerified: user.emailVerified,
          createdAt: new Date(user.metadata.creationTime!),
          updatedAt: new Date(),
        },
        token
      );

      toast.success("Login successful!", {
        description: "Welcome back to Property Purchase Management System",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Failed to login. Please try again.";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Login Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-400 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <p className="text-sm text-slate-400 text-center">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-400 font-semibold"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Created By Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <p className="text-sm text-blue-400 text-center">
            Created By <strong className="text-blue-300">Shivam Jayswal</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
