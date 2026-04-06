import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { orderService, chatService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { connectSocket, joinOrderRoom, leaveOrderRoom, getSocket } from '@lib/socket';
import { formatPrice } from '@lib/utils';
import { FiMessageCircle, FiChevronLeft, FiClock, FiPackage, FiTruck, FiCheck, FiX, FiShield } from 'react-icons/fi';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: { label: 'En attente', icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  preparing: { label: 'En préparation', icon: FiPackage, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  delivering: { label: 'En livraison', icon: FiTruck, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  delivered: { label: 'Livrée', icon: FiCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Annulée', icon: FiX, color: 'text-red-600', bgColor: 'bg-red-100' },
};

const STATUS_FLOW = ['pending', 'preparing', 'delivering', 'delivered'];

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, accessToken } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchOrder = async () => {
      try {
        const response = await orderService.getById(id as string);
        const orderData = response.data?.order || response.data;
        setOrder(orderData);

        // Fetch delivery code if order is in delivering status
        if (orderData?.status === 'delivering' && orderData?.fulfillment === 'delivery') {
          try {
            const codeRes = await orderService.getDeliveryCode(id as string);
            if (codeRes.data?.deliveryCode) {
              setDeliveryCode(codeRes.data.deliveryCode);
            }
          } catch {
            // Code may not exist yet
          }
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  // Socket.IO for real-time updates
  useEffect(() => {
    if (!id || !accessToken) return;

    const socket = connectSocket(accessToken);
    joinOrderRoom(id as string);

    socket.on('new_message', (message: any) => {
      setMessages((prev) => {
        // Skip if already exists (exact ID match)
        if (prev.some((m) => m.id === message.id)) return prev;
        // Replace optimistic message from same sender with real one
        const optimisticIdx = prev.findIndex(
          (m) => m._optimistic && m.senderId === message.senderId && m.content === message.content
        );
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = message;
          return updated;
        }
        return [...prev, message];
      });
      scrollToBottom();
    });

    socket.on('order_status_changed', (data: any) => {
      if (data.orderId === id) {
        setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
        if (data.deliveryCode) {
          setDeliveryCode(data.deliveryCode);
        }
        // Refetch to get full updated data including timeline
        orderService.getById(id as string).then((res) => {
          setOrder(res.data?.order || res.data);
        }).catch(() => {});
      }
    });

    return () => {
      leaveOrderRoom(id as string);
      socket.off('new_message');
      socket.off('order_status_changed');
    };
  }, [id, accessToken]);

  // Fetch messages when chat opens
  useEffect(() => {
    if (!chatOpen || !id) return;

    const fetchMessages = async () => {
      try {
        const response = await chatService.getMessages(id as string);
        setMessages(response.data?.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
    chatService.markAsRead(id as string).catch(() => {});
  }, [chatOpen, id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setSending(true);
    setNewMessage('');

    // Optimistic: show message immediately
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      orderId: id,
      senderId: user?.id,
      content,
      sender: { id: user?.id, fullName: user?.fullName || user?.email, isAdmin: user?.isAdmin },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(id as string, content);
      const savedMsg = response.data?.message;
      // Replace optimistic message with real one from server
      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...savedMsg } : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(content); // Restore the text so user can retry
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <p className="text-xl text-stone-500 mb-4">Commande introuvable</p>
        <Link href="/orders" className="text-crimson hover:text-crimson/80 font-medium">
          ← Mes commandes
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      <Head>
        <title>Commande {order.orderNumber} – GuiGui Pâtisserie</title>
      </Head>

      <div className="min-h-screen bg-stone-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/orders" className="flex items-center gap-1 text-sm text-stone-600 hover:text-crimson transition-colors">
              <FiChevronLeft size={18} /> Commandes
            </Link>
            <span className="font-mono text-xs text-stone-400">{order.orderNumber}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Status Badge */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold text-stone-800">Suivi de commande</h1>
              {(() => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
                    <Icon size={14} /> {cfg.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-stone-400">
              Commandée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* Timeline */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
              <h2 className="text-sm font-bold text-stone-700 mb-5">Progression</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-crimson transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentStatusIndex / (STATUS_FLOW.length - 1)) * 100)}%` }}
                />

                {STATUS_FLOW.map((status, index) => {
                  const cfg = STATUS_CONFIG[status];
                  const Icon = cfg.icon;
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  // Find the timeline entry for this status
                  const logEntry = order.statusLogs?.find((log: any) => log.toStatus === status);

                  return (
                    <div key={status} className="relative flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCurrent ? 'bg-crimson text-white ring-4 ring-crimson/20 scale-110' :
                          isActive ? 'bg-crimson text-white' :
                          'bg-stone-200 text-stone-400'
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <span className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>
                        {cfg.label}
                      </span>
                      {logEntry && (
                        <span className="text-[9px] text-stone-400 mt-0.5">
                          {new Date(logEntry.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled notice */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <FiX className="mx-auto text-red-500 mb-2" size={32} />
              <p className="font-bold text-red-700">Commande annulée</p>
              <p className="text-sm text-red-500 mt-1">Cette commande a été annulée.</p>
            </div>
          )}

          {/* Delivery Code (only when delivering) */}
          {order.status === 'delivering' && order.fulfillment === 'delivery' && (
            <div className="bg-gradient-to-r from-crimson to-crimson/80 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <FiShield size={24} />
                <div>
                  <h3 className="font-bold text-lg">Code de livraison</h3>
                  <p className="text-xs text-white/70">Communiquez ce code au livreur pour confirmer la réception</p>
                </div>
              </div>
              {deliveryCode ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center mt-3">
                  <p className="text-3xl font-mono font-bold tracking-[0.3em]">{deliveryCode}</p>
                  <p className="text-xs text-white/60 mt-2">Valide 24h • Ne partagez qu'avec le livreur</p>
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center mt-3">
                  <p className="text-sm text-white/80">
                    Un code vous sera communiqué par notification.
                    <br />Ne le partagez qu'avec le livreur.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Delivered success */}
          {order.status === 'delivered' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <FiCheck className="mx-auto text-green-500 mb-2" size={32} />
              <p className="font-bold text-green-700">Commande livrée !</p>
              {order.deliveredAt && (
                <p className="text-sm text-green-500 mt-1">
                  Livrée le {new Date(order.deliveredAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-sm font-bold text-stone-700 mb-4">Articles</h2>
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  {item.productSnapshot?.image && (
                    <img
                      src={item.productSnapshot.image.startsWith('http') ? item.productSnapshot.image : `http://localhost:4000${item.productSnapshot.image}`}
                      alt={item.productSnapshot?.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">
                      {item.product?.name || item.productSnapshot?.name || 'Produit'}
                    </p>
                    <p className="text-xs text-stone-400">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-stone-700 text-sm whitespace-nowrap">
                    {formatPrice(item.totalCents)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotalCents)}</span>
              </div>
              {order.deliveryFeeCents > 0 && (
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Livraison</span>
                  <span>{formatPrice(order.deliveryFeeCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-stone-800 pt-2">
                <span>Total</span>
                <span className="text-crimson">{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusLogs && order.statusLogs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
              <h2 className="text-sm font-bold text-stone-700 mb-4">Historique</h2>
              <div className="space-y-3">
                {order.statusLogs.map((log: any) => {
                  const cfg = STATUS_CONFIG[log.toStatus] || STATUS_CONFIG.pending;
                  return (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${cfg.color.replace('text-', 'bg-')}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-800">{cfg.label}</p>
                        {log.note && <p className="text-xs text-stone-500">{log.note}</p>}
                        <p className="text-[10px] text-stone-400">
                          {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                          {log.changer?.fullName && ` • ${log.changer.fullName}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-full py-4 bg-white rounded-2xl shadow-sm border border-stone-200 hover:border-crimson/30 hover:shadow-md transition-all flex items-center justify-center gap-2 text-stone-700 font-medium"
          >
            <FiMessageCircle size={20} className="text-crimson" />
            {chatOpen ? 'Fermer le chat' : 'Discuter de cette commande'}
          </button>

          {/* Chat area */}
          {chatOpen && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-crimson text-white px-6 py-4">
                <h3 className="font-bold">Chat – {order.orderNumber}</h3>
                <p className="text-xs text-white/70">Posez une question sur votre commande</p>
              </div>

              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-stone-50">
                {messages.length === 0 && (
                  <p className="text-center text-stone-400 py-8 text-sm">
                    Aucun message. Posez une question sur votre commande !
                  </p>
                )}
                {messages.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || msg.createdAt} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-crimson text-white rounded-br-sm'
                            : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-bl-sm'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-crimson mb-1">
                            {msg.sender?.fullName || 'Support GuiGui'}
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

              <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none text-sm text-stone-800"
                  maxLength={2000}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2.5 bg-crimson text-white rounded-xl hover:bg-crimson/90 disabled:opacity-50 transition-colors font-medium text-sm"
                >
                  {sending ? '...' : 'Envoyer'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
