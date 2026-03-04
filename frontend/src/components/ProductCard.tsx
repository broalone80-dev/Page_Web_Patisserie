import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@types/index';
import { useCartStore } from '@lib/cartStore';
import { formatPrice } from '@lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    alert('Ajouté au panier!');
  };

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';

  return (
    <div className="card hover:shadow-lg transition duration-300">
      <div className="relative w-full h-48 mb-4 bg-gray-200 rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-gold">{formatPrice(product.priceCents)}</span>
        {product.stock > 0 ? (
          <span className="text-green-600 text-sm font-semibold">En stock</span>
        ) : (
          <span className="text-red-600 text-sm font-semibold">Rupture</span>
        )}
      </div>

      {product.stock > 0 && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value)), product.stock))}
            className="input-field w-16"
          />
          <button
            onClick={handleAddToCart}
            className="btn-primary flex-1"
          >
            Ajouter
          </button>
        </div>
      )}
    </div>
  );
};
