import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { useNetworkRetry } from '@hooks/useNetworkRetry';
import { formatPrice } from '@lib/utils';

export default function Payment() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, isAuthenticated } = useAuth();
  const { retry } = useNetworkRetry();

  const [provider, setProvider] = useState<'flutterwave' | 'cinetpay'>('flutterwave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handlePayment = async () => {
    if (!orderId) {
      setError('ID de commande manquant');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await retry(async () => {
        return await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ orderId, provider }),
        });
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement');
      }

      const data = await response.json();

      if (data.success && data.data.paymentLink) {
        // Redirect to payment provider
        window.location.href = data.data.paymentLink;
      } else {
        setError('Impossible de générer le lien de paiement');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de paiement');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Paiement - Patisserie</title>
      </Head>

      <div className="container-custom max-w-md mx-auto py-12">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6 text-center">Paiement de la commande</h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Numéro de commande:</p>
            <p className="text-lg font-semibold">{orderId}</p>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-3">Choisissez un mode de paiement:</label>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded cursor-pointer hover:border-gold">
                <input
                  type="radio"
                  name="provider"
                  value="flutterwave"
                  checked={provider === 'flutterwave'}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <p className="font-semibold">Flutterwave</p>
                  <p className="text-sm text-gray-600">Paiement par carte, mobile money, etc.</p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded cursor-pointer hover:border-gold">
                <input
                  type="radio"
                  name="provider"
                  value="cinetpay"
                  checked={provider === 'cinetpay'}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <p className="font-semibold">CinetPay</p>
                  <p className="text-sm text-gray-600">Paiement sécurisé local</p>
                </div>
              </label>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Vous serez redirigé vers la plateforme de paiement sécurisée de {provider}.
          </p>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? 'Redirection en cours...' : 'Procéder au paiement'}
          </button>

          <p className="text-center mt-4 text-gray-500 text-sm">
            <a href={`/orders/${orderId}`} className="text-gold hover:underline">
              Retour à la commande
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
