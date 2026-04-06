import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiZoomIn, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ─── Types ───────────────────────────────────────────
type MenuItem = { name: string; price: number; qty?: string; note?: string };
type MenuSection = { title: string; items: MenuItem[] };
type MenuTab = {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
  image: string;
  sections: MenuSection[];
  note?: string;
};

// ─── Data ────────────────────────────────────────────
const MENU_TABS: MenuTab[] = [
  {
    id: 'pastels',
    label: 'Les Pastels',
    emoji: '🥟',
    gradient: 'from-amber-50 to-orange-50',
    image: '/menu-pastels.jpg',
    note: 'Accompagnement à la demande du client — avec ou sans piment. Supplément : Pomme de terre 250 FCFA • Œuf dur 250 FCFA',
    sections: [
      {
        title: 'Nos Pastels',
        items: [
          { name: 'Pastel viande hâchée', price: 1000, qty: '05' },
          { name: 'Pastel viande hâchée fromage', price: 1500, qty: '05' },
          { name: 'Pastel poisson hachée', price: 1000, qty: '05' },
          { name: 'Pastel végétarien', price: 1000, qty: '05' },
        ],
      },
    ],
  },
  {
    id: 'salee',
    label: 'Pause Salée',
    emoji: '🌶️',
    gradient: 'from-red-50 to-rose-50',
    image: '/menu-sale.jpg',
    sections: [
      {
        title: 'Nos Crêpes Salées',
        items: [
          { name: 'Crêpe jambon', price: 2500, qty: '05' },
          { name: 'Crêpe jambon fromage sauce béchamel', price: 3000, qty: '05' },
          { name: 'Crêpe viande hâchée', price: 2500, qty: '05' },
          { name: 'Crêpe viande hâchée fromage', price: 3500, qty: '05' },
          { name: 'Crêpe viande hâchée fromage jambon', price: 5500, qty: '05' },
        ],
      },
      {
        title: 'Nos Gaufres Salées',
        items: [
          { name: 'Gaufre jambon fromage', price: 3500, qty: '05' },
        ],
      },
      {
        title: 'Nos Mini Ardoises',
        items: [
          { name: 'Nems viande', price: 1500, qty: '10' },
          { name: 'Boulette de viande + plantains frits', price: 3000, qty: '10' },
          { name: 'Mini Burger', price: 5000, qty: '10' },
          { name: 'Mini Pizza', price: 5000, qty: '10' },
          { name: 'Mini quiche lorraine', price: 5000, qty: '10' },
        ],
      },
    ],
  },
  {
    id: 'sucree',
    label: 'Pause Sucrée',
    emoji: '🧁',
    gradient: 'from-pink-50 to-fuchsia-50',
    image: '/menu-sucre.jpg',
    sections: [
      {
        title: 'Nos Cakes',
        items: [
          { name: 'Cake nature', price: 3000 },
          { name: 'Cake au citron', price: 3500 },
          { name: 'Cake à l\'orange', price: 3500 },
          { name: 'Cake au yaourt', price: 3500 },
          { name: 'Cake marbré', price: 3500 },
          { name: 'Cake au chocolat', price: 4000 },
          { name: 'Cake Velours', price: 4000 },
          { name: 'Cake à la Carotte', price: 4000 },
          { name: 'Cake Coco', price: 4000 },
          { name: 'Cake Petite Choco', price: 4500 },
          { name: 'Brownies', price: 3500, qty: '10' },
        ],
      },
      {
        title: 'Nos Crêpes Sucrées',
        items: [
          { name: 'Crêpes natures (menthe, vanille, fraise)', price: 1500, qty: '10' },
          { name: 'Crêpes tartinées (confitures, tartina)', price: 2500, qty: '10' },
          { name: 'Crêpes mabrés', price: 1000, qty: '05' },
          { name: 'Crêpes oranges', price: 1000, qty: '05' },
          { name: 'Crêpes chocolat', price: 1000, qty: '05' },
          { name: 'Crêpes nutella', price: 1500, qty: '05' },
          { name: 'Crêpes coco-choco', price: 2000, qty: '05' },
          { name: 'Crêpes nutella mabrés', price: 2000, qty: '05' },
          { name: 'Crêpes croquantes (Ferrero, Kinder Bueno, Nutella, biscuits Oreo)', price: 5000, qty: '05' },
        ],
      },
      {
        title: 'Nos Pancakes',
        items: [
          { name: 'Pancakes natures (menthe, vanille, fraise)', price: 2000 },
          { name: 'Pancakes pépite de chocolat', price: 1500, qty: '05' },
          { name: 'Pancakes au raisin sec', price: 1500, qty: '05' },
          { name: 'Pancakes fourré au nutella', price: 2000, qty: '05' },
        ],
      },
      {
        title: 'Nos Beignets',
        items: [
          { name: 'Beignets soufflé', price: 2500, note: 'à partir de' },
          { name: 'Beignets banane', price: 1500, note: 'à partir de' },
          { name: 'Beignets maïs', price: 1500, note: 'à partir de' },
        ],
      },
      {
        title: 'Nos Gaufres Sucrées',
        items: [
          { name: 'Gaufres natures (menthe, vanille, fraise)', price: 2000, qty: '10' },
          { name: 'Gaufres Tartinées', price: 3000, qty: '10' },
          { name: 'Minis cœurs Gaufres', price: 1000, qty: '10' },
          { name: 'Minis cœurs tartinés', price: 2000, qty: '10' },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────
function formatCFA(cents: number) {
  return cents.toLocaleString('fr-FR') + ' FCFA';
}

// ─── Component ───────────────────────────────────────
export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('pastels');
  const [lightbox, setLightbox] = useState(false);
  const current = MENU_TABS.find((t) => t.id === activeTab)!;

  const goNext = () => {
    const idx = MENU_TABS.findIndex((t) => t.id === activeTab);
    setActiveTab(MENU_TABS[(idx + 1) % MENU_TABS.length].id);
  };
  const goPrev = () => {
    const idx = MENU_TABS.findIndex((t) => t.id === activeTab);
    setActiveTab(MENU_TABS[(idx - 1 + MENU_TABS.length) % MENU_TABS.length].id);
  };

  return (
    <>
      <Head>
        <title>Menu | Chez GuiGui</title>
        <meta name="description" content="Découvrez notre menu complet : pastels, crêpes, gaufres, cakes, beignets et plus encore. Pause sucrée et salée chez GuiGui à Yaoundé." />
      </Head>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-crimson via-crimson-700 to-crimson-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🥐</div>
          <div className="absolute top-20 right-20 text-7xl">🧇</div>
          <div className="absolute bottom-10 left-1/3 text-9xl">🥞</div>
          <div className="absolute bottom-5 right-10 text-6xl">🍰</div>
        </div>
        <div className="container-custom py-16 md:py-24 text-center relative z-10">
          <p className="text-crimson-200 text-sm font-medium tracking-widest uppercase mb-3">Pause sucrée et salée</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Notre Menu
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-base md:text-lg">
            Pastels croustillants, crêpes gourmandes, gaufres dorées, cakes moelleux&hellip;
            Découvrez toutes nos créations artisanales.
          </p>
          <div className="mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-crimson font-bold rounded-full hover:bg-white/90 transition-colors text-sm">
              <FiShoppingCart size={16} />
              Commander en ligne
            </Link>
          </div>
        </div>
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 15C960 30 1200 30 1440 15V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Tab Selector */}
      <section className="bg-white sticky top-16 md:top-20 z-40 border-b border-stone-100">
        <div className="container-custom">
          <div className="flex justify-center gap-2 md:gap-4 py-3 overflow-x-auto">
            {MENU_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-crimson text-white shadow-lg shadow-crimson/20 scale-105'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className={`bg-gradient-to-b ${current.gradient} min-h-[60vh] py-12 md:py-16`}>
        <div className="container-custom">
          {/* Tab Title */}
          <div className="text-center mb-10">
            <span className="text-5xl mb-3 block">{current.emoji}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-800">{current.label}</h2>
            {current.note && (
              <p className="text-sm text-stone-500 mt-3 max-w-lg mx-auto bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2">
                {current.note}
              </p>
            )}
          </div>

          {/* Menu Photo Card */}
          <div className="max-w-2xl mx-auto mb-12">
            <div
              className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-2xl transition-all duration-300"
              onClick={() => setLightbox(true)}
            >
              <Image
                src={current.image}
                alt={`Menu ${current.label}`}
                width={800}
                height={1000}
                className="w-full h-auto object-contain"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-stone-800 rounded-full p-3 shadow-lg">
                  <FiZoomIn size={24} />
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-stone-400 mt-3">
              Cliquez sur l&apos;image pour agrandir
            </p>
          </div>

          {/* Navigation arrows between menus */}
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={goPrev} className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/80 text-stone-600 hover:bg-white hover:text-crimson shadow-sm transition-all text-sm font-medium">
              <FiChevronLeft size={18} />
              Précédent
            </button>
            <button onClick={goNext} className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/80 text-stone-600 hover:bg-white hover:text-crimson shadow-sm transition-all text-sm font-medium">
              Suivant
              <FiChevronRight size={18} />
            </button>
          </div>

          {/* Detail Sections Grid */}
          <div className="mb-4">
            <h3 className="text-center text-lg font-bold text-stone-600 mb-6">Détail des prix</h3>
          </div>

          <div className={`grid gap-8 ${current.sections.length === 1 ? 'max-w-lg mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {current.sections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Section header */}
                <div className="bg-gradient-to-r from-crimson to-crimson-700 px-6 py-4">
                  <h3 className="text-white font-bold text-lg">{section.title}</h3>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-50">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 leading-snug">
                          {item.qty && (
                            <span className="inline-flex items-center justify-center w-7 h-5 bg-crimson/10 text-crimson text-[10px] font-bold rounded mr-1.5">
                              {item.qty}
                            </span>
                          )}
                          {item.name}
                        </p>
                        {item.note && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5">{item.note}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-crimson whitespace-nowrap">
                        {formatCFA(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 mb-3">
            Envie de passer commande ?
          </h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            Commandez en ligne et faites-vous livrer à domicile à Yaoundé, ou passez en boutique !
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="btn-primary">
              <FiShoppingCart size={16} />
              Commander en ligne
            </Link>
            <a
              href="https://wa.me/237693264991"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-outline"
            >
              📱 Commander sur WhatsApp
            </a>
          </div>
          <p className="text-xs text-stone-400 mt-6">
            📍 Yaoundé &bull; 📞 (+237) 693 26 49 91
          </p>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-10"
            onClick={() => setLightbox(false)}
          >
            <FiX size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <FiChevronLeft size={28} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <FiChevronRight size={28} />
          </button>
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={current.image}
              alt={`Menu ${current.label}`}
              width={1200}
              height={1500}
              className="max-h-[90vh] w-auto object-contain rounded-lg"
              priority
            />
            <p className="text-center text-white/70 text-sm mt-3 font-medium">
              {current.emoji} {current.label}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
