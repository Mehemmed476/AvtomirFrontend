"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';
import { User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from '@/components/admin/ConfirmModal';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname.includes('/admin/login');

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <ConfirmProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />
        <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <AdminSidebar />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-6 flex justify-end items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  <User size={18} />
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </AdminAuthGuard>
  );
}