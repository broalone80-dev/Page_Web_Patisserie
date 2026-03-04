import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { orderService, chatService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { connectSocket, joinOrderRoom, leaveOrderRoom, getSocket } from '@lib/socket';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusLabels: Record<string, string> = {
    pending: '⏳ En attente',
    en_preparation: '🍳 En préparation',
    validee: '✅ Validée',
    livree: '🚗 Livrée',
    cancelled: '❌ Annulée',
  };

  const statusProgress: Record<string, number> = {
    pending: 25,
    en_preparation: 50,
    validee: 75,
    livree: 100,
  };

  useEffect(() => {
    if (!id || !user) return;

    const fetchOrder = async () => {
      try {
        const response = await orderService.getById(id as string);
        setOrder(response.data?.order || response.data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  // Socket.IO for real-time chat
  useEffect(() => {
    if (!id || !accessToken || !chatOpen) return;

    const socket = connectSocket(accessToken);
    joinOrderRoom(id as string);

    socket.on('new_message', (message: any) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      leaveOrderRoom(id as string);
      socket.off('new_message');
    };
  }, [id, accessToken, chatOpen]);

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
    chatService.markAsRead(id as string).catch(() => { });
  }, [chatOpen, id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await chatService.sendMessage(id as string, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <p className="text-xl text-stone-500 mb-4">Commande introuvable</p>
        <Link href="/orders" className="text-crimson-600 hover:text-crimson-800 font-medium">
          ← Mes commandes
        </Link>
      </div>
    );
  }

  const progress = statusProgress[order.status] || 0;

  return (
    <>
      <Head>
        <title>Commande {order.orderNumber} – GuiGui Pâtisserie</title>
      </Head>

      <div className="min-h-screen bg-stone-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link href="/orders" className="text-sm text-crimson-600 hover:text-crimson-800 font-medium mb-4 inline-block">
            ← Retour aux commandes
          </Link>

          {/* Order header */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-stone-800">Commande {order.orderNumber}</h1>
                <p className="text-sm text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <p className="text-lg font-bold text-crimson-700">
                {statusLabels[order.status] || order.status}
              </p>
            </div>

            {/* Progress bar */}
            {order.status !== 'cancelled' && (
              <div className="mb-4">
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className="bg-crimson-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-stone-400">
                  <span>En attente</span>
                  <span>Préparation</span>
                  <span>Validée</span>
                  <span>Livrée</span>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Articles</h2>
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800">
                      {item.product?.name || item.productSnapshot?.name || 'Produit'}
                    </p>
                    <p className="text-sm text-stone-500">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-stone-700">
                    {(item.totalCents / 100).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Sous-total</span>
                <span>{(order.subtotalCents / 100).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {order.deliveryFeeCents > 0 && (
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Livraison</span>
                  <span>{(order.deliveryFeeCents / 100).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-stone-800 pt-2">
                <span>Total</span>
                <span className="text-crimson-700">
                  {(order.totalCents / 100).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-full mb-6 py-4 bg-white rounded-2xl shadow-sm border border-stone-200 hover:border-crimson-200 hover:shadow-md transition-all flex items-center justify-center gap-2 text-stone-700 font-medium"
          >
            <span className="text-xl">💬</span>
            {chatOpen ? 'Fermer le chat' : 'Discuter de cette commande'}
          </button>

          {/* Chat area */}
          {chatOpen && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-crimson-600 text-white px-6 py-4">
                <h3 className="font-bold">Chat – Commande {order.orderNumber}</h3>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-stone-50">
                {messages.length === 0 && (
                  <p className="text-center text-stone-400 py-8">
                    Aucun message. Posez une question sur votre commande !
                  </p>
                )}
                {messages.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                            ? 'bg-crimson-600 text-white rounded-br-sm'
                            : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-bl-sm'
                          }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-crimson-600 mb-1">
                            {msg.sender?.fullName || 'Support GuiGui'}
                          </p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-crimson-200' : 'text-stone-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent outline-none text-sm text-stone-800"
                  maxLength={2000}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2.5 bg-crimson-600 text-white rounded-xl hover:bg-crimson-700 disabled:opacity-50 transition-colors font-medium text-sm"
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
