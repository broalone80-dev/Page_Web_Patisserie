import React from 'react';
import { FaStar } from 'react-icons/fa';

interface Testimonial {
    name: string;
    avatar: string;
    rating: number;
    text: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Awa Diop',
        avatar: 'A',
        rating: 5,
        text: '"Les meilleures pâtisseries que j\'ai goûtées à Douala. Croustillantes et la crème au citron est divine."',
    },
    {
        name: 'Marc Laurent',
        avatar: 'M',
        rating: 5,
        text: '"Les cupcakes vanille-fraise sont une bonne habitude. Fondus pour les anniversaires du bureau depuis 2022."',
    },
    {
        name: 'Sophie Ndiaye',
        avatar: 'S',
        rating: 5,
        text: '"Je suis à chaque fois emballage soigné. Les jus de bissap et les beignets sont incomparables."',
    },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                size={14}
                className={i < rating ? 'text-yellow-400' : 'text-gray-200'}
            />
        ))}
    </div>
);

export const TestimonialsSection: React.FC = () => {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="container-custom">
                <h2 className="section-title mb-12">Ce que disent nos gourmands</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-100 rounded-card p-6 hover:shadow-card transition-all duration-300"
                        >
                            <StarRating rating={testimonial.rating} />
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{testimonial.text}</p>
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-crimson/10 text-crimson flex items-center justify-center font-semibold text-sm">
                                    {testimonial.avatar}
                                </div>
                                <span className="font-medium text-dark text-sm">{testimonial.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
