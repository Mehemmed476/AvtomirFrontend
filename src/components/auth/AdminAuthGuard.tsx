"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Authentication Guard HOC
 *
 * Protects admin routes by checking for a valid authentication token.
 *
 * Features:
 * - Checks localStorage for 'admin_token'
 * - Validates token expiry if 'admin_token_expiry' exists
 * - Redirects to /admin/login if no token or expired token
 * - Shows loading state during validation
 *
 * Usage:
 * ```tsx
 * export default function AdminPage() {
 *   return (
 *     <AdminAuthGuard>
 *       <YourAdminContent />
 *     </AdminAuthGuard>
 *   );
 * }
 * ```
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔐 AdminAuthGuard: Starting authentication check...');

        // 1. Check if token exists in localStorage
        const token = localStorage.getItem('admin_token');

        if (!token || token.trim() === '') {
          console.error("🚨 AdminAuthGuard: No valid token in localStorage");
          // Clear any stale data
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_token_expiry');
          router.replace('/admin/login');
          setIsLoading(false);
          return;
        }

        // 2. Verify cookie token matches localStorage (double-check for consistency)
        const getCookie = (name: string): string | null => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
          return null;
        };

        const cookieToken = getCookie('admin_token');
        if (!cookieToken || cookieToken !== token) {
          console.error("🚨 AdminAuthGuard: Token mismatch between cookie and localStorage");
          // Token inconsistency - force re-login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_token_expiry');
          document.cookie = 'admin_token=; path=/; max-age=0';
          router.replace('/admin/login');
          setIsLoading(false);
          return;
        }

        // 3. Check token expiry (if stored)
        const tokenExpiry = localStorage.getItem('admin_token_expiry');

        if (tokenExpiry) {
          const expiryDate = new Date(tokenExpiry);
          const now = new Date();

          if (now >= expiryDate) {
            console.error("🚨 AdminAuthGuard: Token expired");
            // Clear expired token
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_token_expiry');
            document.cookie = 'admin_token=; path=/; max-age=0';
            router.replace('/admin/login');
            setIsLoading(false);
            return;
          }
        }

        // 4. All checks passed - token is valid
        console.log("✅ AdminAuthGuard: Authentication successful");
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

  // Show loading state
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

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
