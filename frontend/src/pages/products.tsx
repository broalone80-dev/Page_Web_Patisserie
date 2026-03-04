import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { productService } from '@services/api';
import { Product } from '@types/index';
import { ProductCard } from '@components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll(0, 20);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Head>
        <title>Produits - Patisserie</title>
      </Head>

      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-12">Nos Produits</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Chargement...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucun produit disponible pour le moment</p>
          </div>
        )}
      </div>
    </>
  );
}
