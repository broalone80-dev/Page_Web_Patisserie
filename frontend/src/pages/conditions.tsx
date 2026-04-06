import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Conditions() {
  return (
    <>
      <Head>
        <title>Conditions d'utilisation - Chez GuiGui</title>
      </Head>

      <div className="container-custom py-12 md:py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Conditions d&apos;utilisation</h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : avril 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">1. Présentation</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site <strong>Chez GuiGui</strong> (« Pause Sucrée et Salée ») est une plateforme de
              commande en ligne de produits de pâtisserie, boulangerie et snacking, opérée à Yaoundé, Cameroun.
              En passant commande, vous acceptez les présentes conditions générales d&apos;utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">2. Commandes</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Les commandes sont validées après confirmation du paiement.</li>
              <li>Nous nous réservons le droit de refuser une commande en cas d&apos;indisponibilité de stock.</li>
              <li>Les prix affichés sont en <strong>Francs CFA (XAF)</strong> et incluent toutes les taxes.</li>
              <li>Une commande confirmée ne peut être annulée que dans l&apos;heure suivant la validation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">3. Paiement</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous acceptons les paiements par <strong>MTN Mobile Money</strong>, <strong>Orange Money</strong>,
              <strong> Visa</strong> et <strong>Mastercard</strong>. Le paiement à la livraison est disponible
              selon le montant de la commande. Toutes les transactions sont sécurisées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">4. Livraison</h2>
            <p className="text-gray-600 leading-relaxed">
              La livraison est disponible dans Yaoundé et ses environs. Les délais et frais de livraison
              sont détaillés sur notre page{' '}
              <Link href="/livraison" className="text-crimson hover:underline">Politique de Livraison</Link>.
              Chez GuiGui ne peut être tenu responsable des retards dus à des circonstances
              exceptionnelles (intempéries, embouteillages majeurs).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">5. Produits</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Nos produits sont fabriqués artisanalement chaque jour avec des ingrédients frais.</li>
              <li>Les photos sur le site sont indicatives ; de légères variations d&apos;apparence sont normales.</li>
              <li>Les informations sur les allergènes sont disponibles sur demande.</li>
              <li>La durée de conservation varie selon le produit (consommation recommandée dans les 24 à 48h).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">6. Protection des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Les données personnelles collectées (nom, email, téléphone, adresse) sont utilisées
              uniquement pour le traitement de vos commandes. Elles ne sont jamais partagées avec des
              tiers sans votre consentement. Vous pouvez demander la suppression de vos données en
              nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative à ces conditions :<br />
              <strong>Téléphone :</strong> +237 693 26 49 91<br />
              <strong>Email :</strong> contact@guigui.cm<br />
              <strong>Adresse :</strong> Yaoundé, Cameroun
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="btn-primary-outline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </>
  );
}
