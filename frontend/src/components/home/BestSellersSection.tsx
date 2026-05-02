import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { productService } from '@services/api';
import { formatPrice } from '@lib/utils';
import { useCartStore } from '@lib/cartStore';
import { Product } from '@/types/index';

interface BestSellerProduct {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    slug: string;
    stock: number;
    isActive: boolean;
    metadata: Record<string, any>;
    images: { id: string; url: string; altText: string; position: number }[];
    createdAt: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80';

const ProductBestSellerCard: React.FC<{ product: BestSellerProduct }> = ({ product }) => {
    const [liked, setLiked] = useState(false);
    const [added, setAdded] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const imageUrl = product.images?.[0]?.url || FALLBACK_IMAGE;

    const handleAddToCart = () => {
        addItem(product as unknown as Product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="bg-white rounded-card shadow-card overflow-hidden group hover:shadow-card-hover transition-all duration-300">
            {/* Image */}
            <div className="relative h-44 sm:h-52 md:h-60 overflow-hidden bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Favorite Button */}
                <button
                    onClick={() => setLiked(!liked)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
                    aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    {liked ? (
                        <FaHeart className="text-crimson" size={16} />
                    ) : (
                        <FiHeart className="text-gray-400 hover:text-crimson" size={16} />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-dark text-sm sm:text-base mb-1 truncate">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3 truncate">{product.description}</p>
                <div className="flex items-center justify-between">
                    <span className="inline-block bg-crimson text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-btn">
                        {formatPrice(product.priceCents)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                            added
                                ? 'bg-green-500 text-white'
                                : 'bg-crimson/10 hover:bg-crimson hover:text-white text-crimson'
                        }`}
                        aria-label="Ajouter au panier"
                    >
                        {added ? (
                            <FiCheck className="w-4 h-4" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BestSellersSection: React.FC = () => {
    const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await productService.getFeatured();
                const products = res.data?.products || [];
                setBestSellers(products.slice(0, 8));
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <section className="py-16 md:py-20 bg-gray-section">
                <div className="container-custom">
                    <h2 className="section-title text-left">Nos Best Sellers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-card shadow-card overflow-hidden animate-pulse">
                                <div className="h-52 md:h-60 bg-gray-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (bestSellers.length === 0) return null;

    return (
        <section className="py-16 md:py-20 bg-gray-section">
            <div className="container-custom">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="section-title text-left">Nos Best Sellers</h2>
                        <p className="text-gray-500 mt-2 text-sm">Les favoris de notre communauté</p>
                    </div>
                    <Link
                        href="/products"
                        className="hidden md:flex items-center gap-1 text-crimson text-sm font-medium hover:underline"
                    >
                        Voir toute la boutique
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <ProductBestSellerCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="md:hidden mt-6 text-center">
                    <Link href="/products" className="btn-primary-outline">
                        Voir toute la boutique
                    </Link>
                </div>
            </div>
        </section>
    );
};
