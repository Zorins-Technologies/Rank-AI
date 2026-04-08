"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, redirect to authentication page
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500 mb-4" />
        <p className="text-gray-400 animate-pulse font-medium">Checking authentication...</p>
      </div>
    );
  }

  // Only render children if user is authenticated
  return user ? children : null;
}
