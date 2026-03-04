import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCartStore } from '@lib/cartStore';
import { formatPrice } from '@lib/utils';
import { useAuth } from '@hooks/useAuth';

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Panier - Patisserie</title>
        </Head>
        <div className="container-custom text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">Explorez nos produits et ajoutez-les à votre panier</p>
          <Link href="/products" className="btn-primary text-lg">
            Continuer vos achats
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Panier - Patisserie</title>
      </Head>

      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Votre Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="card flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.product.priceCents)} x {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value) || 1)
                      }
                      className="input-field w-16"
                    />
                    <span className="font-bold text-lg">{formatPrice(item.totalCents)}</span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="btn-danger"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold text-xl mb-4">Résumé</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison:</span>
                  <span>À calculer</span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total:</span>
                <span className="text-gold">{formatPrice(subtotal)}</span>
              </div>

              {isAuthenticated ? (
                <Link href="/checkout" className="btn-primary w-full text-center block">
                  Procéder au paiement
                </Link>
              ) : (
                <Link href="/auth/login" className="btn-primary w-full text-center block">
                  Se connecter pour payer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
