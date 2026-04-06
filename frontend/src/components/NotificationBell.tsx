import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiBell, FiCheck, FiPackage, FiMessageCircle, FiX } from 'react-icons/fi';
import { notificationService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { getSocket, connectSocket } from '@lib/socket';

export const NotificationBell: React.FC = () => {
  const { user, accessToken } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data?.unreadCount || 0);
      } catch {
        // silent
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000); // Poll every 30s as fallback

    return () => clearInterval(interval);
  }, [user]);

  // Socket listener
  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
    const socket = getSocket();

    const handler = (notif: any) => {
      setUnreadCount((c) => c + 1);
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    };

    socket?.on('notification', handler);
    return () => { socket?.off('notification', handler); };
  }, [accessToken]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && notifications.length === 0) {
      setLoading(true);
      try {
        const res = await notificationService.getAll(1);
        setNotifications(res.data?.notifications || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-dark hover:text-crimson transition-colors"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-crimson text-white text-[9px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-crimson hover:underline font-medium"
                >
                  Tout marquer lu
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600">
                <FiX size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
            {loading && (
              <div className="py-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-crimson border-t-transparent rounded-full mx-auto" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <p className="py-8 text-center text-stone-400 text-sm">Aucune notification</p>
            )}

            {!loading &&
              notifications.map((notif: any, idx: number) => {
                const isOrder = notif.type?.includes('order') || notif.type?.includes('status');
                const isChat = notif.type?.includes('message') || notif.type?.includes('chat');
                const orderId = notif.metadata?.orderId || notif.orderId;
                const isStaff = user?.isAdmin || user?.isManager;
                const notifLink = orderId
                  ? (isStaff ? `/manager` : `/orders/${orderId}`)
                  : (isStaff ? '/manager' : '/orders');

                return (
                  <Link
                    key={notif.id || idx}
                    href={notifLink}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 hover:bg-stone-50 transition-colors ${
                      !notif.isRead ? 'bg-crimson/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isChat ? 'bg-blue-100' : isOrder ? 'bg-yellow-100' : 'bg-stone-100'
                      }`}>
                        {isChat ? (
                          <FiMessageCircle size={14} className="text-blue-600" />
                        ) : (
                          <FiPackage size={14} className="text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${!notif.isRead ? 'text-stone-800' : 'text-stone-600'}`}>
                          {notif.title || 'Notification'}
                        </p>
                        <p className={`text-xs leading-relaxed ${!notif.isRead ? 'text-stone-700' : 'text-stone-500'}`}>
                          {notif.body || ''}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {notif.createdAt
                            ? formatRelativeTime(new Date(notif.createdAt))
                            : "À l'instant"}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-crimson flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-stone-100 text-center">
              <Link
                href={user?.isAdmin || user?.isManager ? '/manager' : '/orders'}
                onClick={() => setOpen(false)}
                className="text-xs text-crimson hover:underline font-medium"
              >
                {user?.isAdmin || user?.isManager ? 'Voir le tableau de bord' : 'Voir toutes les commandes'}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR');
}
