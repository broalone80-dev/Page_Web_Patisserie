import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Comment passer une commande ?',
    answer: 'Parcourez notre boutique, ajoutez les produits souhaités à votre panier, puis validez votre commande en choisissant le mode de livraison et de paiement. Vous recevrez une confirmation par SMS.',
  },
  {
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les commandes passées avant 14h sont livrées le jour même (1 à 3h selon le quartier). Les commandes après 14h sont livrées le lendemain matin. Pour les événements, nous recommandons de commander 24h à l\'avance.',
  },
  {
    question: 'Livrez-vous en dehors de Yaoundé ?',
    answer: 'Nous livrons principalement dans Yaoundé et ses environs proches. Pour les livraisons hors zone, contactez-nous au +237 693 26 49 91 pour étudier la faisabilité.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons MTN Mobile Money, Orange Money, Visa, Mastercard, et le paiement à la livraison pour les commandes dans Yaoundé.',
  },
  {
    question: 'Puis-je annuler ma commande ?',
    answer: 'Vous pouvez annuler votre commande dans l\'heure suivant la validation. Au-delà, la préparation étant déjà lancée, l\'annulation n\'est plus possible. Contactez-nous rapidement en cas de besoin.',
  },
  {
    question: 'Les produits contiennent-ils des allergènes ?',
    answer: 'Nos produits peuvent contenir du gluten, du lait, des œufs, des fruits à coque et du soja. Pour toute allergie spécifique, contactez-nous avant de commander et nous vous conseillerons.',
  },
  {
    question: 'Comment conserver les produits ?',
    answer: 'Nous recommandons de consommer nos produits dans les 24 à 48h. Les cakes se conservent 3 jours à température ambiante. Les crêpes et pastels se conservent 24h au réfrigérateur. Les yaourts doivent être réfrigérés.',
  },
  {
    question: 'Proposez-vous des commandes pour événements ?',
    answer: 'Oui ! Nous préparons des commandes spéciales pour anniversaires, mariages, séminaires et autres événements. Contactez-nous au moins 48h à l\'avance avec les détails (quantités, date, lieu).',
  },
  {
    question: 'Les prix sur le site sont-ils TTC ?',
    answer: 'Oui, tous les prix affichés sont en Francs CFA (XAF) et incluent toutes les taxes. Seuls les frais de livraison s\'ajoutent selon votre zone.',
  },
  {
    question: 'Que faire si ma commande est incomplète ou endommagée ?',
    answer: 'Contactez-nous immédiatement au +237 693 26 49 91 avec une photo du problème. Nous remplacerons les produits ou vous rembourserons sous 48h.',
  },
  {
    question: 'Proposez-vous le retrait en boutique ?',
    answer: 'Oui, choisissez l\'option « Retrait en boutique » lors de la commande. Un SMS de confirmation vous sera envoyé quand votre commande sera prête à récupérer.',
  },
  {
    question: 'Les quantités indiquées (lot de 5, lot de 10) sont-elles modifiables ?',
    answer: 'Les lots sont vendus dans les quantités indiquées sur le menu. Pour des quantités personnalisées ou des commandes en gros, contactez-nous directement.',
  },
];

const FAQAccordion: React.FC<{ item: FAQItem; isOpen: boolean; toggle: () => void }> = ({ item, isOpen, toggle }) => (
  <div className="border border-gray-200 rounded-card overflow-hidden">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
    >
      <span className="font-medium text-dark text-sm md:text-base pr-4">{item.question}</span>
      {isOpen ? (
        <FiChevronUp className="text-crimson flex-shrink-0" size={20} />
      ) : (
        <FiChevronDown className="text-gray-400 flex-shrink-0" size={20} />
      )}
    </button>
    {isOpen && (
      <div className="px-4 md:px-5 pb-4 md:pb-5">
        <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
      </div>
    )}
  </div>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>FAQ - Chez GuiGui</title>
      </Head>

      <div className="container-custom py-12 md:py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">Questions Fréquentes</h1>
          <p className="text-gray-500">Retrouvez les réponses à vos questions les plus courantes.</p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <FAQAccordion
              key={index}
              item={item}
              isOpen={openIndex === index}
              toggle={() => toggle(index)}
            />
          ))}
        </div>

        <div className="mt-12 bg-cream rounded-card p-6 md:p-8 text-center">
          <h3 className="font-semibold text-dark mb-2">Vous n&apos;avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Contactez-nous directement, nous serons ravis de vous aider.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+237693264991" className="btn-primary">
              +237 693 26 49 91
            </a>
            <Link href="/" className="btn-primary-outline">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
