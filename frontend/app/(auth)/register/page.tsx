"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to Clerk sign-up
    router.replace("/sign-up");
  }, [router]);

  return null;
}
