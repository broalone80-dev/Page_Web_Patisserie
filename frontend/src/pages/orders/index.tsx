import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { orderService } from '@services/api';
import { useAuthStore } from '@lib/authStore';

export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await orderService.getAll(page);
                const data = response.data;
                setOrders(data.orders || []);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, page]);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        delivering: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        // Legacy
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
        // Legacy
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
                <title>Mes commandes – GuiGui Pâtisserie</title>
            </Head>

            <div className="min-h-screen bg-stone-50 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-stone-800 mb-6">Mes commandes</h1>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-12 text-center">
                            <p className="text-4xl mb-4">📦</p>
                            <p className="text-lg text-stone-600 mb-4">Aucune commande pour le moment</p>
                            <Link
                                href="/products"
                                className="inline-block px-6 py-3 bg-crimson-600 text-white rounded-xl font-semibold hover:bg-crimson-700 transition-colors"
                            >
                                Voir nos produits
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block bg-white rounded-2xl shadow-sm border border-stone-200 p-6 hover:border-crimson-200 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-stone-800 group-hover:text-crimson-700 transition-colors">
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-stone-100'}`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-stone-600">
                                            {order.items?.length || 0} article(s)
                                        </p>
                                        <p className="font-bold text-crimson-700">
                                            {(order.totalCents / 100).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>

                                    {order.unreadMessages > 0 && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-crimson-600">
                                            <span className="w-5 h-5 rounded-full bg-crimson-600 text-white flex items-center justify-center text-xs font-bold">
                                                {order.unreadMessages}
                                            </span>
                                            Nouveau(x) message(s)
                                        </div>
                                    )}
                                </Link>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm disabled:opacity-50 hover:border-crimson-200"
                                    >
                                        ← Précédent
                                    </button>
                                    <span className="text-sm text-stone-500">
                                        Page {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm disabled:opacity-50 hover:border-crimson-200"
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
