import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: About */}
          <div>
            <Image
              src="/logo.svg"
              alt="GuiGui"
              width={120}
              height={50}
              className="h-10 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Bienvenu chez nous où chaque bouchée raconte une histoire. Des produits frais, une fabrication artisanale et un engagement pour la qualité et le goût authentique.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <FiMapPin size={14} className="text-crimson" />
                Yaoundé, Cameroun
              </span>
              <span className="flex items-center gap-2">
                <FiPhone size={14} className="text-crimson" />
                +237 693 26 49 91
              </span>
              <span className="flex items-center gap-2">
                <FiPhone size={14} className="text-crimson" />
                +237 6 88 33 98 00
              </span>
              <span className="flex items-center gap-2">
                <FiMail size={14} className="text-crimson" />
                contact@guigui.cm
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Liens Rapides</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/orders', label: 'Ma Commande' },
                { href: '/livraison', label: 'Politique de Livraison' },
                { href: '/conditions', label: 'Conditions d\'utilisation' },
                { href: '/livraison#retours', label: 'Livraison & Retours' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-crimson transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Boutique */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Boutique</h4>
            <ul className="space-y-3">
              {[
                { href: '/products?collection=cupcakes-gateaux', label: 'Cupcakes & Gâteaux' },
                { href: '/products?collection=sales-street-food', label: 'Salés & Street Food' },
                { href: '/products?collection=boissons', label: 'Boissons Fraîches' },
                { href: '/products?collection=coffrets', label: 'Nos Coffrets' },
                { href: '/products', label: 'Nos Collections' },
                { href: '/products?collection=promotions', label: 'Promotions' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 text-sm hover:text-crimson transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social & Payment */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Suivez-nous</h4>
            <div className="flex gap-3 mb-8">
              {[
                { icon: FiInstagram, label: 'Instagram', href: '#' },
                { icon: FiFacebook, label: 'Facebook', href: '#' },
                { icon: FiTwitter, label: 'Twitter', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-crimson transition-all duration-300"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Paiement sécurisé</h4>
            <div className="flex gap-3">
              {['Visa', 'MC', 'MTN', 'OM'].map((method) => (
                <div
                  key={method}
                  className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs text-gray-300 font-medium"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Chez GuiGui. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-xs">
            Fabriqué avec ❤️ à Yaoundé, Cameroun par <a href="https://github.com/broalone80-dev" target="_blank" rel="noopener noreferrer" className="text-crimson hover:text-crimson-light transition-colors">broalone80-dev</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
