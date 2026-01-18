"use client"; // Bu sətri mütləq əlavə edin (usePathname üçün)

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hazırkı səhifənin Login olub-olmadığını yoxlayırıq
  const isLoginPage = pathname.includes('/admin/login');

  // 1. Əgər LOGIN səhifəsidirsə -> Sidebar və AuthGuard-ı YIĞIŞDIRIRIQ
  // Sadəcə təmiz bir mərkəzləşdirilmiş ekran göstəririk
  if (isLoginPage) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
           {children}
        </div>
    );
  }

  // 2. Digər bütün Admin səhifələri -> Sidebar + AuthGuard AKTİVDİR
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar (Sol Menyu) */}
        <AdminSidebar />

        {/* Əsas Məzmun Sahəsi */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Admin Header (Yuxarı hissə) */}
          <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center border-b border-gray-200">
             <div className="text-lg font-bold text-gray-700">Admin Panel</div>
             <div className="text-sm text-gray-500 font-medium">Avtomir.az</div>
          </header>

          {/* Səhifələrin məzmunu bura düşür */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}