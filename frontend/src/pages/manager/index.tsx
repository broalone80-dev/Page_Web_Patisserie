import { useState, useEffect, useRef, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { managerService, chatService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { formatPrice } from '@lib/utils';
import { connectSocket, getSocket, joinOrderRoom, leaveOrderRoom } from '@lib/socket';
import {
  FiPackage, FiClock, FiTruck, FiCheck, FiX, FiMessageCircle,
  FiChevronRight, FiArrowLeft, FiPhone, FiUser, FiRefreshCw,
  FiAlertCircle, FiHash,
} from 'react-icons/fi';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string; next?: string; nextLabel?: string }> = {
  pending: { label: 'En attente', icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', next: 'preparing', nextLabel: 'Commencer préparation' },
  preparing: { label: 'En préparation', icon: FiPackage, color: 'text-blue-600', bgColor: 'bg-blue-100', next: 'delivering', nextLabel: 'Envoyer en livraison' },
  delivering: { label: 'En livraison', icon: FiTruck, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  delivered: { label: 'Livrée', icon: FiCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Annulée', icon: FiX, color: 'text-red-600', bgColor: 'bg-red-100' },
};

type ViewMode = 'dashboard' | 'orders' | 'order-detail';

export default function ManagerDashboard() {
  const router = useRouter();
  const { user, accessToken, isManager, isAdmin } = useAuthStore();
  const [view, setView] = useState<ViewMode>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersStats, setOrdersStats] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (user && !isManager() && !isAdmin()) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Connect socket
  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
      const socket = getSocket();
      if (socket) {
        socket.on('notification', () => {
          setRefreshKey((k) => k + 1);
        });
        socket.on('order_status_changed', () => {
          setRefreshKey((k) => k + 1);
        });
      }
    }
  }, [accessToken]);

  // Fetch dashboard
  useEffect(() => {
    if (!user || (!isManager() && !isAdmin())) return;

    const fetchDashboard = async () => {
      try {
        const res = await managerService.getDashboard();
        const data = res.data || res;
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey]);

  // Fetch orders when viewing orders list
  useEffect(() => {
    if (view !== 'orders') return;

    const fetchOrders = async () => {
      try {
        const res = await managerService.getOrders(1, 50, statusFilter !== 'all' ? statusFilter : undefined);
        const data = res.data || res;
        setOrders(data.orders || []);
        setOrdersStats(data.stats || null);
      } catch (err) {
        console.error('Orders error:', err);
      }
    };

    fetchOrders();
  }, [view, statusFilter, refreshKey]);

  // Chat: fetch messages and socket
  useEffect(() => {
    if (!chatOpen || !selectedOrder) return;

    const fetchMessages = async () => {
      try {
        const res = await chatService.getMessages(selectedOrder.id);
        setMessages(res.data?.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error('Chat error:', err);
      }
    };

    fetchMessages();
    chatService.markAsRead(selectedOrder.id).catch(() => {});

    joinOrderRoom(selectedOrder.id);
    const socket = getSocket();
    const handler = (msg: any) => {
      if (msg.orderId === selectedOrder.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // Replace optimistic message from same sender with real one
          const optimisticIdx = prev.findIndex(
            (m) => m._optimistic && m.senderId === msg.senderId && m.content === msg.content
          );
          if (optimisticIdx !== -1) {
            const updated = [...prev];
            updated[optimisticIdx] = msg;
            return updated;
          }
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };
    socket?.on('new_message', handler);

    return () => {
      leaveOrderRoom(selectedOrder.id);
      socket?.off('new_message', handler);
    };
  }, [chatOpen, selectedOrder]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedOrder) return;

    const content = newMessage.trim();
    setSending(true);
    setNewMessage('');

    // Optimistic: show message immediately
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      orderId: selectedOrder.id,
      senderId: user?.id,
      content,
      sender: { id: user?.id, fullName: user?.fullName || user?.email, isAdmin: user?.isAdmin },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(selectedOrder.id, content);
      const savedMsg = response.data?.message;
      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...savedMsg } : m))
        );
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await managerService.updateOrderStatus(orderId, newStatus);
      const data = res.data || res;

      // If delivery code was generated, show it
      if (data.deliveryCode) {
        alert(`Code de livraison généré : ${data.deliveryCode}\n\nCe code a été envoyé au client.`);
      }

      setRefreshKey((k) => k + 1);

      // Refresh the selected order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateDelivery = async () => {
    if (!selectedOrder || otpCode.length !== 6) return;
    setActionLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await managerService.validateDelivery(selectedOrder.id, otpCode);
      setOtpSuccess('Livraison confirmée !');
      setOtpCode('');
      setRefreshKey((k) => k + 1);
      setSelectedOrder({ ...selectedOrder, status: 'delivered' });
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Code invalide');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Annuler cette commande ?')) return;
    await handleStatusChange(orderId, 'cancelled');
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setView('order-detail');
    setChatOpen(false);
    setOtpCode('');
    setOtpError('');
    setOtpSuccess('');
  };

  if (!user || (!isManager() && !isAdmin())) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Gestion – GuiGui Pâtisserie</title>
      </Head>

      <div className="min-h-screen bg-stone-50">
        {/* Top bar */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== 'dashboard' && (
                <button
                  onClick={() => {
                    if (view === 'order-detail') setView('orders');
                    else setView('dashboard');
                  }}
                  className="text-stone-500 hover:text-crimson transition-colors"
                >
                  <FiArrowLeft size={20} />
                </button>
              )}
              <h1 className="text-lg font-bold text-stone-800">
                🧁 {view === 'dashboard' ? 'Gestion' : view === 'orders' ? 'Commandes' : selectedOrder?.orderNumber}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-2 text-stone-500 hover:text-crimson transition-colors"
                title="Rafraîchir"
              >
                <FiRefreshCw size={18} />
              </button>
              <Link href="/" className="text-xs text-stone-400 hover:text-crimson">
                Retour au site
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* ===================== DASHBOARD VIEW ===================== */}
          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="En attente"
                  value={stats?.pendingOrders || 0}
                  color="bg-yellow-50 text-yellow-700 border-yellow-200"
                  icon={FiClock}
                  onClick={() => { setStatusFilter('pending'); setView('orders'); }}
                />
                <StatCard
                  label="En préparation"
                  value={stats?.preparingOrders || 0}
                  color="bg-blue-50 text-blue-700 border-blue-200"
                  icon={FiPackage}
                  onClick={() => { setStatusFilter('preparing'); setView('orders'); }}
                />
                <StatCard
                  label="En livraison"
                  value={stats?.deliveringOrders || 0}
                  color="bg-purple-50 text-purple-700 border-purple-200"
                  icon={FiTruck}
                  onClick={() => { setStatusFilter('delivering'); setView('orders'); }}
                />
                <StatCard
                  label="Livrées aujourd'hui"
                  value={stats?.deliveredToday || 0}
                  color="bg-green-50 text-green-700 border-green-200"
                  icon={FiCheck}
                  onClick={() => { setStatusFilter('delivered'); setView('orders'); }}
                />
              </div>

              {/* Revenue & Messages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-stone-200 p-5">
                  <p className="text-xs text-stone-400 mb-1">Revenus total</p>
                  <p className="text-xl font-bold text-stone-800">{formatPrice(stats?.totalRevenue || 0)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-5">
                  <p className="text-xs text-stone-400 mb-1">Messages non lus</p>
                  <p className="text-xl font-bold text-crimson">{stats?.unreadMessages || 0}</p>
                </div>
              </div>

              {/* Quick actions */}
              <button
                onClick={() => { setStatusFilter('all'); setView('orders'); }}
                className="w-full py-4 bg-crimson text-white rounded-2xl font-bold text-sm hover:bg-crimson/90 transition-colors flex items-center justify-center gap-2"
              >
                <FiPackage size={18} /> Voir toutes les commandes
              </button>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-stone-200">
                <div className="p-4 border-b border-stone-100">
                  <h2 className="font-bold text-stone-800">Commandes récentes</h2>
                </div>
                <div className="divide-y divide-stone-100">
                  {recentOrders.slice(0, 10).map((order: any) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={order.id}
                        onClick={() => openOrderDetail(order)}
                        className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center gap-3"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-stone-800 truncate">
                              {order.user?.fullName || order.user?.phone || 'Client'}
                            </p>
                            <p className="text-xs font-semibold text-stone-600 whitespace-nowrap ml-2">
                              {formatPrice(order.totalCents)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <FiChevronRight size={16} className="text-stone-300" />
                      </button>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <p className="text-center py-8 text-stone-400 text-sm">Aucune commande</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== ORDERS LIST VIEW ===================== */}
          {view === 'orders' && (
            <div className="space-y-4">
              {/* Status filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {[
                  { value: 'all', label: 'Toutes', count: ordersStats?.total },
                  { value: 'pending', label: 'En attente', count: ordersStats?.pending },
                  { value: 'preparing', label: 'Préparation', count: ordersStats?.preparing },
                  { value: 'delivering', label: 'Livraison', count: ordersStats?.delivering },
                  { value: 'delivered', label: 'Livrées', count: ordersStats?.delivered },
                ].map(({ value, label, count }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      statusFilter === value
                        ? 'bg-crimson text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:border-crimson/30'
                    }`}
                  >
                    {label} {count !== undefined && `(${count})`}
                  </button>
                ))}
              </div>

              {/* Orders list */}
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  const itemCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                    >
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="w-full text-left p-4 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-stone-800">{order.user?.fullName || 'Client'}</p>
                            <p className="text-xs text-stone-400 flex items-center gap-1">
                              {order.user?.phone && <><FiPhone size={10} /> {order.user.phone} •</>}
                              {' '}{order.orderNumber}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.bgColor} ${cfg.color}`}>
                            <Icon size={12} /> {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-stone-500">{itemCount} article(s)</p>
                          <p className="text-sm font-bold text-crimson">{formatPrice(order.totalCents)}</p>
                        </div>
                        {order.unreadMessages > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-crimson font-medium">
                            <FiMessageCircle size={12} /> {order.unreadMessages} message(s)
                          </div>
                        )}
                      </button>

                      {/* Quick actions */}
                      {cfg.next && (
                        <div className="px-4 pb-3 flex gap-2">
                          <button
                            onClick={() => handleStatusChange(order.id, cfg.next!)}
                            disabled={actionLoading}
                            className="flex-1 py-2 bg-crimson text-white text-xs font-semibold rounded-xl hover:bg-crimson/90 transition-colors disabled:opacity-50"
                          >
                            {cfg.nextLabel}
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={actionLoading}
                              className="py-2 px-4 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div className="text-center py-12 text-stone-400">
                    <FiPackage className="mx-auto mb-3" size={32} />
                    <p>Aucune commande</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== ORDER DETAIL VIEW ===================== */}
          {view === 'order-detail' && selectedOrder && (
            <div className="space-y-4">
              {/* Client info */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center">
                    <FiUser size={18} className="text-crimson" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{selectedOrder.user?.fullName || 'Client'}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      {selectedOrder.user?.phone && (
                        <a href={`tel:${selectedOrder.user.phone}`} className="flex items-center gap-1 text-crimson hover:underline">
                          <FiPhone size={10} /> {selectedOrder.user.phone}
                        </a>
                      )}
                      {selectedOrder.user?.email && <span>{selectedOrder.user.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Mode</span>
                  <span className="font-medium text-stone-700">
                    {selectedOrder.fulfillment === 'delivery' ? '🚚 Livraison' : '🏪 Retrait'}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="mt-2 p-3 bg-stone-50 rounded-xl text-xs text-stone-600">
                    <strong>Note :</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Status + actions */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                {(() => {
                  const cfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
                        <Icon size={14} /> {cfg.label}
                      </span>
                      <span className="text-lg font-bold text-crimson">{formatPrice(selectedOrder.totalCents)}</span>
                    </div>
                  );
                })()}

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-stone-50 last:border-0">
                      <span className="text-stone-700">
                        {item.product?.name || item.productSnapshot?.name} × {item.quantity}
                      </span>
                      <span className="text-stone-600 font-medium">{formatPrice(item.totalCents)}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                {(() => {
                  const cfg = STATUS_CONFIG[selectedOrder.status];
                  if (!cfg?.next) return null;
                  return (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, cfg.next!)}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-crimson text-white font-bold text-sm rounded-xl hover:bg-crimson/90 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? 'En cours...' : cfg.nextLabel}
                      </button>
                      {selectedOrder.status !== 'delivering' && (
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          disabled={actionLoading}
                          className="py-3 px-5 border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* OTP Validation (when delivering) */}
              {selectedOrder.status === 'delivering' && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FiHash size={18} className="text-crimson" />
                    <h3 className="font-bold text-stone-800">Valider la livraison</h3>
                  </div>
                  <p className="text-xs text-stone-500 mb-4">
                    Demandez le code à 6 chiffres au client pour confirmer la réception.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(v);
                        setOtpError('');
                      }}
                      placeholder="000000"
                      className="flex-1 px-4 py-3 text-center text-xl font-mono tracking-[0.3em] border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none"
                      maxLength={6}
                      inputMode="numeric"
                    />
                    <button
                      onClick={handleValidateDelivery}
                      disabled={otpCode.length !== 6 || actionLoading}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? '...' : <FiCheck size={20} />}
                    </button>
                  </div>
                  {otpError && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs">
                      <FiAlertCircle size={12} /> {otpError}
                    </div>
                  )}
                  {otpSuccess && (
                    <div className="mt-2 flex items-center gap-1.5 text-green-600 text-xs font-medium">
                      <FiCheck size={12} /> {otpSuccess}
                    </div>
                  )}
                </div>
              )}

              {/* Chat button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="w-full py-4 bg-white rounded-2xl border border-stone-200 hover:border-crimson/30 transition-all flex items-center justify-center gap-2 text-stone-700 font-medium"
              >
                <FiMessageCircle size={18} className="text-crimson" />
                {chatOpen ? 'Fermer le chat' : 'Chat avec le client'}
                {selectedOrder.unreadMessages > 0 && (
                  <span className="w-5 h-5 rounded-full bg-crimson text-white text-[10px] font-bold flex items-center justify-center">
                    {selectedOrder.unreadMessages}
                  </span>
                )}
              </button>

              {/* Chat panel */}
              {chatOpen && (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <div className="bg-crimson text-white px-5 py-3">
                    <p className="font-bold text-sm">Chat – {selectedOrder.user?.fullName || 'Client'}</p>
                  </div>

                  <div className="h-72 overflow-y-auto p-4 space-y-3 bg-stone-50">
                    {messages.length === 0 && (
                      <p className="text-center text-stone-400 py-8 text-sm">Aucun message</p>
                    )}
                    {messages.map((msg: any) => {
                      const isMe = msg.senderId === user?.id || msg.sender?.isAdmin || msg.sender?.isManager;
                      return (
                        <div key={msg.id || msg.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-crimson text-white rounded-br-sm'
                              : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-bl-sm'
                          }`}>
                            {!isMe && (
                              <p className="text-xs font-medium text-crimson mb-1">
                                {msg.sender?.fullName || 'Client'}
                              </p>
                            )}
                            <p>{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-stone-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Répondre..."
                      className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson"
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-5 py-2.5 bg-crimson text-white rounded-xl hover:bg-crimson/90 disabled:opacity-50 transition-colors font-medium text-sm"
                    >
                      {sending ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${color}`}>
      <Icon size={20} className="mb-2 opacity-70" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] font-medium opacity-70">{label}</p>
    </button>
  );
}
