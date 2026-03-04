import React, { useRef } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const categories = [
    {
        name: 'Cupcakes',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&q=80',
    },
    {
        name: 'Crêpes',
        image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80',
    },
    {
        name: 'Pasteis',
        image: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400&q=80',
    },
    {
        name: 'Beignets',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    },
    {
        name: 'Glaces',
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    },
    {
        name: 'Jus naturels',
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
    },
];

export const CategoriesSection: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 220;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

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
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer snap-center"
                                aria-label={`Catégorie ${cat.name}`}
                            >
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-3 border-transparent group-hover:border-crimson transition-all duration-300 shadow-card">
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <span className="text-sm font-medium text-dark group-hover:text-crimson transition-colors">
                                    {cat.name}
                                </span>
                            </button>
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
