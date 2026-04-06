import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { paymentService } from '@services/api';
import { FiPhone, FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';

type Provider = 'orange_money' | 'mtn_momo';
type PaymentStep = 'select' | 'processing' | 'success' | 'failed';

export default function Payment() {
  const router = useRouter();
  const { orderId } = router.query;
  const { isAuthenticated } = useAuth();

  const [provider, setProvider] = useState<Provider>('orange_money');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<PaymentStep>('select');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Auto-detect provider from phone prefix
  useEffect(() => {
    const clean = phone.replace(/[\s\-]/g, '');
    if (clean.match(/^(69|655|656|657|658|659)/)) {
      setProvider('orange_money');
    } else if (clean.match(/^(67|650|651|652|653|654|68)/)) {
      setProvider('mtn_momo');
    }
  }, [phone]);

  const pollStatus = useCallback(
    (pId: string) => {
      pollCountRef.current = 0;
      pollRef.current = setInterval(async () => {
        pollCountRef.current++;

        // Stop polling after 3 min (36 polls * 5s)
        if (pollCountRef.current > 36) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatusMessage('Délai dépassé. Vérifiez votre téléphone ou réessayez.');
          return;
        }

        try {
          const res = await paymentService.checkStatus(pId);
          const status = res.data?.status || res.status;
          const message = res.data?.message || res.message;

          setStatusMessage(message || '');

          if (status === 'successful') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep('success');
          } else if (status === 'failed' || status === 'cancelled') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep('failed');
          }
        } catch {
          // Network error — keep polling (weak network tolerance)
        }
      }, 5000);
    },
    []
  );

  const handlePayment = async () => {
    if (!orderId || typeof orderId !== 'string') {
      setError('ID de commande manquant');
      return;
    }

    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (!/^6\d{8}$/.test(cleanPhone)) {
      setError('Numéro invalide. Format: 6XXXXXXXX (9 chiffres)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await paymentService.initiate(orderId, provider, cleanPhone);
      const pId = res.data?.paymentId;

      if (pId) {
        setPaymentId(pId);
        setStep('processing');
        setStatusMessage(res.message || 'Validez le paiement sur votre téléphone...');
        pollStatus(pId);
      } else {
        setError(res.message || 'Erreur inattendue');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erreur de paiement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep('select');
    setError('');
    setPaymentId(null);
    setStatusMessage('');
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Paiement - Chez Guigui</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* ─── STEP: Select provider ─── */}
          {step === 'select' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-center mb-6">Paiement Mobile Money</h1>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Phone input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
                    maxLength={13}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Le réseau est détecté automatiquement
                </p>
              </div>

              {/* Provider selection */}
              <div className="mb-6 space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    provider === 'orange_money'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setProvider('orange_money')}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={provider === 'orange_money'}
                    onChange={() => setProvider('orange_money')}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    OM
                  </div>
                  <div>
                    <p className="font-semibold">Orange Money</p>
                    <p className="text-xs text-gray-500">69X, 655-659</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    provider === 'mtn_momo'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                  onClick={() => setProvider('mtn_momo')}
                >
                  <input
                    type="radio"
                    name="provider"
                    checked={provider === 'mtn_momo'}
                    onChange={() => setProvider('mtn_momo')}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    MTN
                  </div>
                  <div>
                    <p className="font-semibold">MTN Mobile Money</p>
                    <p className="text-xs text-gray-500">67X, 650-654, 68X</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !phone}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-lg transition-colors"
              >
                {loading ? 'Envoi en cours...' : 'Payer maintenant'}
              </button>

              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1"
              >
                <FiArrowLeft size={14} /> Retour à la commande
              </button>
            </div>
          )}

          {/* ─── STEP: Processing (waiting for phone validation) ─── */}
          {step === 'processing' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <FiLoader className="w-16 h-16 mx-auto text-amber-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                Validez sur votre téléphone
              </h2>
              <p className="text-gray-600 mb-4">
                {statusMessage || `Un prompt ${provider === 'orange_money' ? 'Orange Money' : 'MTN MoMo'} a été envoyé sur votre téléphone. Entrez votre code PIN pour confirmer.`}
              </p>

              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  {provider === 'orange_money'
                    ? '📱 Tapez votre code secret Orange Money quand le menu apparaît'
                    : '📱 Validez la demande MTN MoMo sur votre téléphone'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={() => paymentId && pollStatus(paymentId)}
                  className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm"
                >
                  Actualiser le statut
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP: Success ─── */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiCheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Paiement confirmé !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre commande est en cours de préparation.
              </p>
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
              >
                Voir ma commande
              </button>
            </div>
          )}

          {/* ─── STEP: Failed ─── */}
          {step === 'failed' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiXCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                Paiement échoué
              </h2>
              <p className="text-gray-600 mb-6">
                {statusMessage || 'Le paiement n\'a pas abouti. Réessayez.'}
              </p>
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl mb-3"
              >
                Réessayer
              </button>
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Retour à la commande
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
