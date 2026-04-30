"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to Clerk sign-in
    router.replace("/sign-in");
  }, [router]);

  return null;
}
