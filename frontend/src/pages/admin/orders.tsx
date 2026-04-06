import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { adminService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { AdminLayout } from '@components/AdminLayout';

const statusOptions = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'validee', label: 'Validée' },
  { value: 'livree', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  en_preparation: 'bg-blue-100 text-blue-800',
  validee: 'bg-green-100 text-green-800',
  livree: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  en_preparation: 'En préparation',
  validee: 'Validée',
  livree: 'Livrée',
  cancelled: 'Annulée',
};

export default function AdminOrders() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders(page, 20, filterStatus !== 'all' ? filterStatus : undefined);
      const data = res.data || res;
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Commandes – Admin GuiGui</title>
      </Head>

      <AdminLayout title="Gestion des Commandes">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setFilterStatus(opt.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === opt.value
                  ? 'bg-crimson text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">N° Commande</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Articles</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Date</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-700">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{order.user?.fullName || '–'}</p>
                      <p className="text-xs text-stone-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {order.items?.length || 0} article{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-700 whitespace-nowrap">
                      {((order.totalCents || 0) / 100).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-500 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-crimson outline-none disabled:opacity-50"
                      >
                        {statusOptions.filter((o) => o.value !== 'all').map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-stone-400">
                      Aucune commande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-white border border-stone-200 rounded-lg disabled:opacity-50 hover:bg-stone-50"
            >
              Précédent
            </button>
            <span className="text-sm text-stone-500">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm bg-white border border-stone-200 rounded-lg disabled:opacity-50 hover:bg-stone-50"
            >
              Suivant
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
