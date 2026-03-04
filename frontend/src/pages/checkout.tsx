import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCartStore } from '@lib/cartStore';
import { useAuth } from '@hooks/useAuth';
import { orderService } from '@services/api';
import { formatPrice } from '@lib/utils';

export default function Checkout() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clear);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fulfillment: 'delivery' as 'delivery' | 'pickup',
    street: '',
    city: '',
    region: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, items, router]);

  const deliveryFee = formData.fulfillment === 'delivery' ? 5000 : 0; // 50,000 XAF = 5000 cents
  const tax = Math.floor(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const order = await orderService.create(
        orderItems,
        formData.fulfillment
      );

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Paiement - Patisserie</title>
      </Head>

      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="card mb-8">
              <h3 className="font-bold text-xl mb-4">Adresse de livraison</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Mode</label>
                  <select
                    name="fulfillment"
                    value={formData.fulfillment}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="delivery">Livraison à domicile</option>
                    <option value="pickup">Retrait sur place</option>
                  </select>
                </div>

                {formData.fulfillment === 'delivery' && (
                  <>
                    <div>
                      <label className="block font-semibold mb-2">Rue</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="123 Avenue de la Paix"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Ville</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="input-field"
                          placeholder="Yaoundé"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">Région</label>
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleChange}
                          required
                          className="input-field"
                          placeholder="Centre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Code postal</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="00237"
                      />
                    </div>
                  </>
                )}

                <h3 className="font-bold text-xl mt-6 mb-4">Récapitulatif articles</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{formatPrice(item.totalCents)}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'Création en cours...' : 'Créer la commande'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold text-xl mb-4">Total</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxe (5%):</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-gold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
