import React from 'react';
import Head from 'next/head';
import { HeroSection } from '@components/home/HeroSection';
import { AdvantagesSection } from '@components/home/AdvantagesSection';
import { CategoriesSection } from '@components/home/CategoriesSection';
import { BestSellersSection } from '@components/home/BestSellersSection';
import { TestimonialsSection } from '@components/home/TestimonialsSection';
import { NewsletterSection } from '@components/home/NewsletterSection';

export default function Home() {
  return (
    <>
      <Head>
        <title>GuiGui - Pause sucrée et salée | Pâtisserie artisanale</title>
        <meta name="description" content="Découvrez les pâtisseries artisanales de GuiGui. Cupcakes, crêpes, pasteis, beignets et jus naturels faits maison au Cameroun." />
      </Head>

      <HeroSection />
      <AdvantagesSection />
      <CategoriesSection />
      <BestSellersSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
