import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@lib/cartStore';
import { formatPrice } from '@lib/utils';
import { useAuth } from '@hooks/useAuth';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <>
        <Head><title>Panier – GuiGui Pâtisserie</title></Head>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-5">
            <FiShoppingBag className="text-stone-400" size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Votre panier est vide</h1>
          <p className="text-stone-500 text-sm mb-6 text-center">Explorez nos produits et ajoutez-les à votre panier</p>
          <Link href="/products" className="btn-primary">
            Voir la boutique
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Panier ({totalItems}) – GuiGui Pâtisserie</title></Head>

      <div className="container-custom py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Mon Panier</h1>
            <p className="text-sm text-stone-400 mt-1">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm text-stone-500 hover:text-crimson transition-colors">
            <FiArrowLeft size={16} /> Continuer
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 sm:p-4 flex gap-3 sm:gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.product.images?.[0]?.url ? (
                    <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍰</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-800 text-sm sm:text-base truncate">{item.product.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">{formatPrice(item.product.priceCents)} / unité</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors">
                        <FiMinus size={14} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-stone-800 bg-stone-50">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors">
                        <FiPlus size={14} />
                      </button>
                    </div>

                    {/* Price + delete */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-800 text-sm sm:text-base">{formatPrice(item.totalCents)}</span>
                      <button onClick={() => removeItem(item.productId)}
                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 lg:sticky lg:top-20">
              <h3 className="font-bold text-stone-800 mb-4">Résumé</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Sous-total ({totalItems} articles)</span>
                  <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Livraison</span>
                  <span className="text-stone-400 text-xs">Calculée à l&apos;étape suivante</span>
                </div>
              </div>
              <hr className="my-4 border-stone-100" />
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-crimson">{formatPrice(subtotal)}</span>
              </div>

              {subtotal < 1500000 && (
                <p className="text-xs text-crimson mb-4 bg-crimson/5 rounded-lg p-2.5">
                  💡 Plus que <strong>{formatPrice(1500000 - subtotal)}</strong> pour la livraison gratuite !
                </p>
              )}

              {isAuthenticated ? (
                <Link href="/checkout" className="block w-full py-3.5 bg-crimson text-white font-semibold rounded-xl text-center hover:bg-crimson-dark transition-colors">
                  Procéder au paiement
                </Link>
              ) : (
                <Link href="/auth/login?redirect=/cart" className="block w-full py-3.5 bg-crimson text-white font-semibold rounded-xl text-center hover:bg-crimson-dark transition-colors">
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
