import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCartStore } from '@lib/cartStore';
import { useAuth } from '@hooks/useAuth';
import { orderService } from '@services/api';
import { formatPrice } from '@lib/utils';
import { FiMapPin, FiShoppingBag, FiChevronLeft, FiCheck, FiPhone } from 'react-icons/fi';

type PaymentMethod = 'orange_money' | 'mtn_momo' | 'cash_on_delivery';
type Fulfillment = 'delivery' | 'pickup';

export default function Checkout() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clear);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [address, setAddress] = useState({
    street: '',
    city: 'Yaoundé',
    quarter: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [momoPhone, setMomoPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && items.length === 0 && !orderCreated) {
      router.push('/cart');
    }
  }, [items, authLoading, isAuthenticated, orderCreated, router]);

  // Delivery fee fetched from server
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    if (fulfillment === 'pickup') {
      setDeliveryFee(0);
      return;
    }
    const params = new URLSearchParams({
      fulfillment,
      quarter: address.quarter || '',
      subtotal: String(subtotal),
    });
    orderService.getDeliveryFee(params.toString())
      .then((res: any) => {
        setDeliveryFee(res.data?.deliveryFeeCents ?? 100000);
      })
      .catch(() => setDeliveryFee(100000));
  }, [fulfillment, address.quarter, subtotal]);

  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const result = await orderService.create({
        items: orderItems,
        fulfillment,
        quarter: address.quarter || undefined,
        notes: address.notes || undefined,
        paymentMethod,
        paymentPhone: momoPhone || undefined,
      });
      const orderId = result.data?.order?.id || result.data?.id || result.id;

      setOrderCreated(orderId);
      clearCart();
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (step === 3 && orderCreated) {
    return (
      <>
        <Head><title>Commande confirmée – GuiGui</title></Head>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Commande confirmée !</h1>
            <p className="text-stone-500 text-sm mb-6">
              {paymentMethod === 'cash_on_delivery'
                ? 'Votre commande a été enregistrée. Vous payerez à la livraison.'
                : `Un message de confirmation sera envoyé sur votre ${paymentMethod === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money'}.`}
            </p>

            {paymentMethod !== 'cash_on_delivery' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  {paymentMethod === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN Mobile Money'}
                </p>
                <p className="text-xs text-amber-700">
                  Composez <strong>{paymentMethod === 'orange_money' ? '#150#' : '*126#'}</strong> pour valider le paiement envoyé à votre numéro <strong>{momoPhone}</strong>.
                </p>
              </div>
            )}

            <p className="text-xs text-stone-400 mb-6">N° commande : <strong className="text-stone-600">{orderCreated?.slice(0, 8)}...</strong></p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push('/products')} className="btn-primary flex-1 justify-center">
                Continuer à acheter
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Commande – GuiGui Pâtisserie</title></Head>
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => step === 1 ? router.push('/cart') : setStep(step - 1)} className="flex items-center gap-1 text-sm text-stone-600 hover:text-crimson transition-colors">
              <FiChevronLeft size={18} /> Retour
            </button>
            <h1 className="font-bold text-stone-800 text-sm sm:text-base">Commande</h1>
            <div className="flex items-center gap-1.5">
              {[1, 2].map((s) => (
                <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s <= step ? 'bg-crimson' : 'bg-stone-300'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}

              {step === 1 && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
                    <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <FiMapPin className="text-crimson" size={18} /> Mode de réception
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: 'delivery' as const, label: '🚚 Livraison', desc: 'À votre adresse' },
                        { value: 'pickup' as const, label: '🏪 Retrait', desc: 'Chez GuiGui' },
                      ]).map((opt) => (
                        <button key={opt.value} onClick={() => setFulfillment(opt.value)}
                          className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${fulfillment === opt.value ? 'border-crimson bg-crimson/5' : 'border-stone-200 hover:border-stone-300'}`}>
                          <span className="block text-sm font-semibold text-stone-800">{opt.label}</span>
                          <span className="block text-xs text-stone-400 mt-0.5">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {fulfillment === 'delivery' && (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
                      <h2 className="font-bold text-stone-800 mb-4">Adresse de livraison</h2>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Quartier *</label>
                            <input type="text" value={address.quarter} onChange={(e) => setAddress({ ...address, quarter: e.target.value })}
                              placeholder="Ex: Bastos, Mvan, Essos..." className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all" required />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Ville</label>
                            <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all bg-stone-50" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Adresse complète *</label>
                          <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            placeholder="N° rue, repère proche..." className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all" required />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Téléphone pour le livreur *</label>
                          <input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                            placeholder="6XX XXX XXX" className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all" required />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Instructions (optionnel)</label>
                          <textarea value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                            placeholder="Indications pour le livreur..." rows={2}
                            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all resize-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  <button onClick={() => {
                    if (fulfillment === 'delivery' && (!address.quarter || !address.street || !address.phone)) {
                      setError('Veuillez remplir tous les champs obligatoires');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }} className="w-full py-3.5 bg-crimson text-white font-semibold rounded-xl hover:bg-crimson-dark transition-colors">
                    Continuer vers le paiement
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
                    <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <FiPhone className="text-crimson" size={18} /> Mode de paiement
                    </h2>
                    <div className="space-y-3">
                      <button onClick={() => setPaymentMethod('orange_money')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === 'orange_money' ? 'border-orange-400 bg-orange-50' : 'border-stone-200 hover:border-stone-300'}`}>
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">OM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">Orange Money</p>
                          <p className="text-xs text-stone-400">Paiement mobile Orange Cameroun</p>
                        </div>
                        {paymentMethod === 'orange_money' && <FiCheck className="text-orange-500 flex-shrink-0" size={20} />}
                      </button>

                      <button onClick={() => setPaymentMethod('mtn_momo')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === 'mtn_momo' ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'}`}>
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-bold text-sm">MM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">MTN Mobile Money</p>
                          <p className="text-xs text-stone-400">Paiement mobile MTN Cameroun</p>
                        </div>
                        {paymentMethod === 'mtn_momo' && <FiCheck className="text-yellow-500 flex-shrink-0" size={20} />}
                      </button>

                      <button onClick={() => setPaymentMethod('cash_on_delivery')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-green-400 bg-green-50' : 'border-stone-200 hover:border-stone-300'}`}>
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">💵</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">Paiement à la livraison</p>
                          <p className="text-xs text-stone-400">Payez en espèces à la réception</p>
                        </div>
                        {paymentMethod === 'cash_on_delivery' && <FiCheck className="text-green-500 flex-shrink-0" size={20} />}
                      </button>
                    </div>

                    {paymentMethod !== 'cash_on_delivery' && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Numéro {paymentMethod === 'orange_money' ? 'Orange' : 'MTN'} *
                        </label>
                        <input type="tel" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)}
                          placeholder={paymentMethod === 'orange_money' ? '6 9X XXX XXX' : '6 7X XXX XXX'}
                          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson/20 focus:border-crimson outline-none transition-all" required />
                        <p className="text-xs text-stone-400 mt-1">Vous recevrez une demande de paiement sur ce numéro.</p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => {
                    if (paymentMethod !== 'cash_on_delivery' && !momoPhone) {
                      setError('Veuillez entrer votre numéro de téléphone');
                      return;
                    }
                    setError('');
                    handleSubmitOrder();
                  }} disabled={loading}
                    className="w-full py-3.5 bg-crimson text-white font-semibold rounded-xl hover:bg-crimson-dark transition-colors disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Validation en cours...
                      </span>
                    ) : (
                      `Confirmer et payer ${formatPrice(total)}`
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 lg:sticky lg:top-20">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 text-sm">
                  <FiShoppingBag className="text-crimson" size={16} />
                  Résumé ({items.length} article{items.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        {item.product.images?.[0]?.url ? (
                          <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs">🍰</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-stone-400">x{item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-stone-700 flex-shrink-0">{formatPrice(item.totalCents)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Livraison</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee > 0 && subtotal < 1500000 && (
                    <p className="text-xs text-crimson">💡 Plus que {formatPrice(1500000 - subtotal)} pour la livraison gratuite !</p>
                  )}
                  <div className="flex justify-between font-bold text-stone-800 text-base pt-2 border-t border-stone-100">
                    <span>Total</span><span className="text-crimson">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
