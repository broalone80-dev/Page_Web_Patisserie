import React from 'react';

const advantages = [
    {
        icon: (
            <svg className="w-8 h-8 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: '100% Artisanal',
        description: 'Savoir-faire traditionnel transmis avec passion et authenticité',
    },
    {
        icon: (
            <svg className="w-8 h-8 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        title: 'Ingrédients Frais',
        description: 'Sélectionnés avec soin, des ingrédients frais et de qualité',
    },
    {
        icon: (
            <svg className="w-8 h-8 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        title: 'Fait Maison',
        description: 'Chaque pâtisserie est préparée à la main avec amour et dévouement',
    },
];

export const AdvantagesSection: React.FC = () => {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {advantages.map((adv, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-6 rounded-card border border-gray-100 hover:shadow-card transition-all duration-300"
                        >
                            <div className="flex-shrink-0 w-14 h-14 bg-crimson/5 rounded-full flex items-center justify-center">
                                {adv.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-dark text-lg mb-1">{adv.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{adv.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
