import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { categoryService } from '@services/api';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    image?: string;
    productCount?: number;
}

const CATEGORY_IMAGES: Record<string, string> = {
    'patisserie': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
    'viennoiserie': 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80',
    'boulangerie': 'https://images.unsplash.com/photo-1549931319-a545753d62ce?w=400&q=80',
    'snacking-sale': 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400&q=80',
    'boissons': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
    'glaces': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    'cupcakes': 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&q=80',
    'crepes': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80',
    'gateaux': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
    'beignets': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    'tartes': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    'jus-naturels': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
    'petit-dejeuner': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80',
    'default': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
};

const getCategoryImage = (slug: string, image?: string): string => {
    if (image) return image;
    return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES['default'];
};

export const CategoriesSection: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll();
                const cats = res.data?.categories || [];
                // Filter to only parent categories (no parentId) with products
                const parentCats = cats.filter((c: any) => !c.parentId);
                setCategories(parentCats);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 220;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (loading || categories.length === 0) return null;

    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="container-custom">
                <h2 className="section-title mb-3">Nos Catégories</h2>
                <p className="section-subtitle mb-10">
                    Explorez notre univers gourmand à travers nos spécialités sélectionnées avec soin.
                </p>

                <div className="relative">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 bg-white shadow-card rounded-full flex items-center justify-center text-dark hover:text-crimson hover:shadow-card-hover transition-all duration-200 hidden md:flex"
                        aria-label="Catégorie précédente"
                    >
                        <FiChevronLeft size={20} />
                    </button>

                    {/* Scrollable Categories */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide px-2 py-4 snap-x snap-mandatory justify-center"
                    >
                    {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer snap-center"
                                aria-label={`Catégorie ${cat.name}`}
                            >
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-3 border-transparent group-hover:border-crimson transition-all duration-300 shadow-card">
                                    <Image
                                        src={getCategoryImage(cat.slug, cat.image)}
                                        alt={cat.name}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <span className="text-sm font-medium text-dark group-hover:text-crimson transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 bg-white shadow-card rounded-full flex items-center justify-center text-dark hover:text-crimson hover:shadow-card-hover transition-all duration-200 hidden md:flex"
                        aria-label="Catégorie suivante"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};
