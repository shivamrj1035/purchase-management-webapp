"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Clerk handles password reset in the sign-in flow
    router.replace("/sign-in");
  }, [router]);

  return null;
}
