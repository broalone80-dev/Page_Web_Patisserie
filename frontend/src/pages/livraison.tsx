import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiTruck, FiClock, FiMapPin, FiPhone, FiRefreshCw } from 'react-icons/fi';

export default function Livraison() {
  return (
    <>
      <Head>
        <title>Politique de Livraison & Retours - Chez GuiGui</title>
      </Head>

      <div className="container-custom py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Politique de Livraison</h1>
        <p className="text-gray-500 mb-10">Tout savoir sur nos livraisons à Yaoundé et environs.</p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center">
                <FiTruck className="text-crimson" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Zone de Livraison</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nous livrons dans toute la ville de Yaoundé et ses environs proches.
              Pour les commandes en dehors de cette zone, merci de nous contacter
              directement au <strong>+237 693 26 49 91</strong>.
            </p>
          </div>

          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center">
                <FiClock className="text-crimson" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Délais de Livraison</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Les livraisons sont effectuées <strong>le jour même</strong> pour les commandes
              passées avant 14h. Les commandes passées après 14h sont livrées le lendemain matin.
              Délai moyen : <strong>1 à 3 heures</strong> selon votre quartier.
            </p>
          </div>

          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center">
                <FiMapPin className="text-crimson" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Frais de Livraison</h2>
            </div>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex justify-between"><span>Centre-ville Yaoundé</span><strong>500 FCFA</strong></li>
              <li className="flex justify-between"><span>Quartiers périphériques</span><strong>1.000 FCFA</strong></li>
              <li className="flex justify-between"><span>Hors Yaoundé (sur devis)</span><strong>Nous contacter</strong></li>
              <li className="pt-2 border-t text-crimson font-medium">Livraison gratuite à partir de 15.000 FCFA d'achat</li>
            </ul>
          </div>

          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-crimson/10 rounded-full flex items-center justify-center">
                <FiPhone className="text-crimson" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Retrait en Boutique</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Vous pouvez aussi récupérer votre commande directement chez nous à Yaoundé.
              Choisissez l'option <strong>« Retrait en boutique »</strong> lors de votre commande.
              Un SMS de confirmation vous sera envoyé quand votre commande sera prête.
            </p>
          </div>
        </div>

        {/* Retours */}
        <div id="retours" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FiRefreshCw className="text-crimson" size={24} />
            <h2 className="text-2xl font-bold text-dark">Retours & Réclamations</h2>
          </div>
          <div className="bg-cream rounded-card p-6 md:p-8">
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Chez GuiGui, la satisfaction de nos clients est notre priorité. Si un produit
                ne correspond pas à vos attentes, voici notre politique :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Produit endommagé à la livraison :</strong> Contactez-nous dans les 2 heures suivant la réception avec une photo. Nous remplacerons le produit ou vous rembourserons.</li>
                <li><strong>Erreur de commande :</strong> Si nous avons fait une erreur, nous corrigeons immédiatement et sans frais.</li>
                <li><strong>Produits périssables :</strong> Étant donné la nature de nos produits (pâtisseries, crêpes, etc.), les retours ne sont acceptés que si le produit est défectueux ou ne correspond pas à la commande.</li>
                <li><strong>Remboursement :</strong> Les remboursements sont effectués sous 48h via le même moyen de paiement utilisé.</li>
              </ul>
              <p className="pt-2">
                Pour toute réclamation : <strong>+237 693 26 49 91</strong> ou <strong>contact@guigui.cm</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/products" className="btn-primary">
            Voir la boutique
          </Link>
        </div>
      </div>
    </>
  );
}
