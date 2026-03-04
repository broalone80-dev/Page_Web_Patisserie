import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface BestSellerProduct {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
}

const bestSellers: BestSellerProduct[] = [
    {
        id: 1,
        name: 'Cupcake Vanille-Fraise',
        description: 'Nos Vanille croustillant, crème...',
        price: '3.500 FCFA',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&q=80',
    },
    {
        id: 2,
        name: 'Pasteis Thon',
        description: 'Les incontournables, dorés au...',
        price: '1.500 FCFA',
        image: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=500&q=80',
    },
    {
        id: 3,
        name: 'Jus de Bissap Maison',
        description: 'Frais, parfumé, à la menthe et...',
        price: '1.000 FCFA',
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&q=80',
    },
    {
        id: 4,
        name: 'Beignets Soufflés',
        description: 'Moelleux, légers et légèrement...',
        price: '2.000 FCFA',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80',
    },
];

const ProductBestSellerCard: React.FC<{ product: BestSellerProduct }> = ({ product }) => {
    const [liked, setLiked] = useState(false);

    return (
        <div className="bg-white rounded-card shadow-card overflow-hidden group hover:shadow-card-hover transition-all duration-300">
            {/* Image */}
            <div className="relative h-52 md:h-60 overflow-hidden bg-gray-100">
                <Image
                    src={product.image}
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
            <div className="p-4">
                <h3 className="font-semibold text-dark text-base mb-1 truncate">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3 truncate">{product.description}</p>
                <div className="flex items-center justify-between">
                    <span className="inline-block bg-crimson text-white text-xs font-bold px-3 py-1.5 rounded-btn">
                        {product.price}
                    </span>
                    <button
                        className="w-9 h-9 bg-crimson/10 rounded-full flex items-center justify-center hover:bg-crimson hover:text-white text-crimson transition-all duration-200"
                        aria-label="Ajouter au panier"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BestSellersSection: React.FC = () => {
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
