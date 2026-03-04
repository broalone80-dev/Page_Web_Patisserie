import React, { useState } from 'react';

export const NewsletterSection: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            alert(`Merci ! Vous recevrez nos actualités à ${email}`);
            setEmail('');
        }
    };

    return (
        <section className="py-16 md:py-20">
            <div className="container-custom">
                <div className="bg-newsletter-red rounded-2xl px-6 py-12 md:px-16 md:py-16 text-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10">
                        <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-3">
                            Rejoignez le club des gourmands
                        </h2>
                        <p className="text-white/80 text-sm md:text-base mb-8 max-w-xl mx-auto">
                            Inscrivez-vous pour recevoir nos recettes, nos offres exclusives et 10% de réduction sur votre première commande.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Votre email"
                                className="flex-1 px-5 py-3 rounded-btn border-0 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                                aria-label="Adresse email pour la newsletter"
                                required
                            />
                            <button
                                type="submit"
                                className="px-7 py-3 bg-dark text-white font-semibold rounded-btn hover:bg-gray-800 transition-all duration-300 text-sm whitespace-nowrap"
                            >
                                S&apos;inscrire
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};
