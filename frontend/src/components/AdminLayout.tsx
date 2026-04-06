import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/products', label: 'Produits', icon: FiPackage },
  { href: '/admin/orders', label: 'Commandes', icon: FiShoppingBag },
  { href: '/admin/users', label: 'Clients', icon: FiUsers },
];

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-stone-800">🧁 GuiGui Admin</h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-crimson text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Link href="/" className="flex items-center gap-1 text-stone-500 hover:text-crimson text-sm">
            <FiArrowLeft size={14} />
            Retour au site
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-2 flex gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-crimson text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Page title */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {children}
      </div>
    </div>
  );
};
