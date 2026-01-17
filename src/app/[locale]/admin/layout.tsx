import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // DÜZƏLİŞ: bg-black yerinə bg-gray-100 (Açıq boz fon)
    // text-white yerinə text-gray-900 (Tünd yazılar)
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      
      {/* Sol Tərəf - Sidebar */}
      <AdminSidebar />

      {/* Sağ Tərəf - Məzmun */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-sm font-medium text-gray-600">Xoş gəldiniz, Admin</h2>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              A
            </div>
        </header>

        {/* Əsas Məzmun Scroll */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
             {children}
          </div>
        </main>
      </div>

    </div>
  );
}