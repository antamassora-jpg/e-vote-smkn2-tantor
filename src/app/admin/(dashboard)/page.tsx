"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the main dashboard page
export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  
  return null;
}
