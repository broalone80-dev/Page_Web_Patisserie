import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/index';
import { useCartStore } from '@lib/cartStore';
import { formatPrice } from '@lib/utils';
import { FiMinus, FiPlus, FiCheck } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden group hover:shadow-card-hover transition-all duration-300">
      <div className="relative w-full h-44 sm:h-52 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Rupture</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-dark text-sm sm:text-base mb-1 truncate">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg sm:text-xl font-bold text-crimson">{formatPrice(product.priceCents)}</span>
          {product.stock > 0 && (
            <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">En stock</span>
          )}
        </div>

        {product.stock > 0 && (
          <div className="flex gap-2 items-center">
            <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-stone-800 bg-stone-50">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
              >
                <FiPlus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-crimson text-white hover:bg-crimson-dark'
              }`}
            >
              {added ? (
                <><FiCheck size={16} /> Ajouté !</>
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
