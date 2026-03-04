import React from 'react';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1587668178277-295251f900ce?w=1600&q=80')`,
                }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/55" />

            {/* Content */}
            <div className="relative z-10 container-custom h-full flex flex-col justify-center">
                <div className="max-w-2xl animate-fade-in-up">
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                        Bienvenu chez nous
                        <br />
                        <span className="text-orange-light">où chaque bouchée</span> raconte une histoire
                    </h1>
                    <p className="text-gray-200 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                        Découvrez nos pâtisseries artisanales à Yaoundé. Du cupcake fondant au croissant croustillant, chaque création est une invitation au voyage des saveurs.
                    </p>
                    <Link href="/products" className="btn-primary text-base px-8 py-4">
                        Commander maintenant
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};
