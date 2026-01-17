import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">İdarəetmə Paneli</h1>

      {/* Statistika Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Cəmi Məhsul", value: "120", icon: Package, color: "text-blue-500 bg-blue-500/10" },
          { label: "Sifarişlər", value: "8", icon: ShoppingCart, color: "text-purple-500 bg-purple-500/10" },
          { label: "Müştərilər", value: "45", icon: Users, color: "text-green-500 bg-green-500/10" },
          { label: "Gəlir", value: "1,250 ₼", icon: DollarSign, color: "text-yellow-500 bg-yellow-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-900 border border-dark-700 p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Son Əməliyyatlar (Placeholder) */}
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-4">Sistem Vəziyyəti</h3>
        <p className="text-gray-400">Admin panel hazırdır. Məhsul və Kateqoriyaları idarə etməyə başlaya bilərsiniz.</p>
      </div>
    </div>
  );
}