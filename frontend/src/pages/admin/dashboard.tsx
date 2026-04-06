import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { adminService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { AdminLayout } from '@components/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/auth/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await adminService.getDashboard();
        const data = response.data;
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setRecentUsers(data.recentUsers || []);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    // legacy compat
    en_preparation: 'bg-blue-100 text-blue-800',
    validee: 'bg-green-100 text-green-800',
    livree: 'bg-emerald-100 text-emerald-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    preparing: 'En préparation',
    delivering: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    // legacy compat
    en_preparation: 'En préparation',
    validee: 'Validée',
    livree: 'Livrée',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Admin – GuiGui Pâtisserie</title>
      </Head>

      <AdminLayout title={`Bienvenue, ${user?.fullName || user?.email || 'Admin'}`}>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Clients"
              value={stats?.totalUsers || 0}
              icon="👥"
              color="bg-blue-50 text-blue-700"
            />
            <StatCard
              title="Produits"
              value={stats?.totalProducts || 0}
              icon="🧁"
              color="bg-orange-50 text-orange-700"
            />
            <StatCard
              title="Commandes"
              value={stats?.totalOrders || 0}
              icon="📦"
              color="bg-green-50 text-green-700"
              subtitle={`${stats?.pendingOrders || 0} en attente`}
            />
            <StatCard
              title="Revenus"
              value={`${((stats?.totalRevenue || 0) / 100).toLocaleString('fr-FR')} FCFA`}
              icon="💰"
              color="bg-crimson-50 text-crimson-700"
            />
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 mb-8">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-800">Commandes récentes</h2>
              <Link href="/admin/orders" className="text-sm text-crimson-600 hover:text-crimson-800 font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-stone-600 font-medium">Commande</th>
                    <th className="text-left px-6 py-3 text-stone-600 font-medium">Client</th>
                    <th className="text-left px-6 py-3 text-stone-600 font-medium">Statut</th>
                    <th className="text-right px-6 py-3 text-stone-600 font-medium">Total</th>
                    <th className="text-right px-6 py-3 text-stone-600 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-stone-700">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-stone-700">
                        {order.user?.fullName || order.user?.email || '–'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-stone-700">
                        {(order.totalCents / 100).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-right text-stone-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-stone-400">
                        Aucune commande pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Nouveaux clients</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold text-sm">
                      {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{u.fullName || 'Sans nom'}</p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="text-center py-8 text-stone-400">
                  Aucun client récent
                </div>
              )}
            </div>
          </div>
      </AdminLayout>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{title}</span>
      </div>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
    </div>
  );
}
