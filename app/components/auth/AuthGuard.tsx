"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken } from "@/app/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/signin");
      } else {
        setIsAuth(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      )
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

// Hook to get current user
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const user = getUserFromToken();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for storage changes (e.g., when tokens are set in another tab or after login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lycusa_access_token" || e.key === null) {
        checkUser();
      }
    };

    // Listen for custom event when tokens are set in the same tab
    const handleAuthChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
