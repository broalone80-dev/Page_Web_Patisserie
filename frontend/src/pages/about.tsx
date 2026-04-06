import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiStar, FiUsers, FiAward, FiMapPin, FiClock } from 'react-icons/fi';

export default function About() {
  return (
    <>
      <Head>
        <title>À propos - Chez GuiGui</title>
        <meta name="description" content="Découvrez l'histoire de Chez GuiGui, pâtisserie artisanale à Yaoundé, Cameroun." />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            À propos de <span className="text-crimson">Chez GuiGui</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Une passion familiale pour la pâtisserie, au cœur de Yaoundé.
          </p>
        </div>
      </section>

      <div className="container-custom py-12 md:py-16">
        {/* Notre histoire */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-crimson font-semibold text-sm uppercase tracking-wider">Notre histoire</span>
              <h2 className="text-3xl font-bold text-dark mt-2 mb-4">
                Née d'une passion, portée par le goût
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Chez GuiGui</strong> est née de la passion de Guillaine pour la pâtisserie artisanale.
                Ce qui a commencé comme une aventure familiale dans notre cuisine à Yaoundé est devenu
                une référence locale, reconnue pour la qualité de ses produits et le soin apporté à chaque création.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Chaque jour, nous sélectionnons les meilleurs ingrédients locaux pour vous offrir des
                pâtisseries fraîches, des plats salés savoureux et des boissons qui font la différence.
                Pas de conservateurs, pas de raccourcis — juste du fait-maison avec amour.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Notre engagement est simple : vous offrir le meilleur de la pâtisserie camerounaise
                et internationale, avec une touche d'authenticité qui nous est propre.
              </p>
            </div>
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg bg-amber-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-crimson/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHeart className="text-crimson" size={40} />
                  </div>
                  <p className="text-crimson font-bold text-xl">Fait avec amour</p>
                  <p className="text-gray-500 text-sm mt-1">depuis Yaoundé 🇨🇲</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="text-crimson font-semibold text-sm uppercase tracking-wider">Nos valeurs</span>
            <h2 className="text-3xl font-bold text-dark mt-2">Ce qui nous définit</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiStar,
                title: 'Qualité',
                desc: 'Des ingrédients frais et sélectionnés avec soin, pour des produits d\'exception.',
              },
              {
                icon: FiHeart,
                title: 'Passion',
                desc: 'Chaque création est le fruit d\'un amour sincère pour l\'art de la pâtisserie.',
              },
              {
                icon: FiUsers,
                title: 'Proximité',
                desc: 'Un service attentionné et personnalisé. Vous êtes au centre de nos préoccupations.',
              },
              {
                icon: FiAward,
                title: 'Authenticité',
                desc: 'Des recettes authentiques, mêlant traditions camerounaises et inspirations internationales.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-card shadow-card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-crimson/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-crimson" size={24} />
                </div>
                <h3 className="font-semibold text-dark mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres */}
        <section className="mb-16 bg-crimson rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Produits au catalogue' },
              { value: '1000+', label: 'Clients satisfaits' },
              { value: '14', label: 'Catégories gourmandes' },
              { value: '7j/7', label: 'À votre service' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-bold">{value}</p>
                <p className="text-white/80 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Équipe */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="text-crimson font-semibold text-sm uppercase tracking-wider">Notre équipe</span>
            <h2 className="text-3xl font-bold text-dark mt-2">Les visages derrière GuiGui</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Guillaine',
                role: 'Fondatrice & Chef pâtissière',
                desc: 'Passionnée depuis l\'enfance, Guillaine crée chaque recette avec amour et créativité.',
              },
              {
                name: 'L\'équipe cuisine',
                role: 'Préparation & Qualité',
                desc: 'Une équipe dévouée qui veille à la fraîcheur et à la qualité de chaque produit.',
              },
              {
                name: 'L\'équipe livraison',
                role: 'Livraison & Service client',
                desc: 'Rapides et souriants, ils s\'assurent que votre commande arrive en parfait état.',
              },
            ].map(({ name, role, desc }) => (
              <div key={name} className="bg-white rounded-card shadow-card p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-crimson/20 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="text-crimson" size={28} />
                </div>
                <h3 className="font-semibold text-dark text-lg">{name}</h3>
                <p className="text-crimson text-sm mb-2">{role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Infos pratiques */}
        <section className="mb-10">
          <div className="bg-white rounded-card shadow-card p-8">
            <h2 className="text-2xl font-bold text-dark mb-6 text-center">Où nous trouver</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-crimson" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Adresse</h3>
                  <p className="text-gray-500 text-sm">Yaoundé, Cameroun</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-crimson" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Horaires</h3>
                  <p className="text-gray-500 text-sm">Lundi – Dimanche : 8h – 20h</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Envie de goûter à notre savoir-faire ?</p>
          <Link
            href="/products"
            className="inline-block bg-crimson text-white px-8 py-3 rounded-full font-semibold hover:bg-crimson/90 transition-colors"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    </>
  );
}
