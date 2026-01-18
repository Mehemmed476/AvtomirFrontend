"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Authentication Guard
 * Cookie-dən token oxuyur və yoxlayır.
 * Middleware ilə birlikdə işləyir.
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Cookie-dən token oxu
        const token = Cookies.get('token');

        if (!token || token.trim() === '') {
          console.warn("🚨 AdminAuthGuard: No token in cookies");
          router.replace('/admin/login');
          setIsLoading(false);
          return;
        }

        // Token mövcuddur
        console.log("✅ AdminAuthGuard: Token found");
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("🔴 AdminAuthGuard: Auth check error:", error);
        router.replace('/admin/login');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Yoxlanılır...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
