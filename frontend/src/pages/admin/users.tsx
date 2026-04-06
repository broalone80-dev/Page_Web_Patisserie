import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { adminService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { AdminLayout } from '@components/AdminLayout';
import { FiSearch } from 'react-icons/fi';

export default function AdminUsers() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, 20, search || undefined);
      const data = res.data || res;
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setTogglingId(userId);
    try {
      await adminService.toggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      console.error('Toggle user status error:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Clients – Admin GuiGui</title>
      </Head>

      <AdminLayout title="Gestion des Clients">
        {/* Search */}
        <div className="flex items-center gap-3 mb-6 bg-white rounded-lg shadow-sm border border-stone-200 px-4 py-2">
          <FiSearch className="text-stone-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
          <span className="text-xs text-stone-400">{total} client{total !== 1 ? 's' : ''}</span>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Téléphone</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Commandes</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Rôle</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u: any) => (
                  <tr key={u.id} className={`hover:bg-stone-50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-crimson/10 text-crimson flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{u.fullName || 'Sans nom'}</p>
                          <p className="text-xs text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{u.phone || '–'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600">
                        {u._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                        {u.isAdmin ? 'Admin' : 'Client'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={togglingId === u.id || u.isAdmin}
                        className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-50 ${u.isActive ? 'bg-green-500' : 'bg-stone-300'}`}
                        title={u.isAdmin ? 'Impossible de désactiver un admin' : u.isActive ? 'Désactiver' : 'Activer'}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.isActive ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-400">
                      Aucun client trouvé
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
