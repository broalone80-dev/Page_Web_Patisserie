import React, { useState } from 'react';
import Head from 'next/head';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.message.trim()) {
      setError('Veuillez remplir au moins votre nom et votre message.');
      return;
    }

    setSending(true);

    // Simulate sending (no backend endpoint for contact yet)
    // In production, this would POST to /api/contact
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      <Head>
        <title>Contact - Chez GuiGui</title>
        <meta name="description" content="Contactez Chez GuiGui, pâtisserie artisanale à Yaoundé. Téléphone, WhatsApp, email." />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Contactez-<span className="text-crimson">nous</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            Une question, une commande spéciale ou un avis ? On est là pour vous.
          </p>
        </div>
      </section>

      <div className="container-custom py-12 md:py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Coordonnées */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark mb-6">Nos coordonnées</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-crimson" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Adresse</h3>
                  <p className="text-gray-500 text-sm">Yaoundé, Cameroun</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-crimson" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Téléphone</h3>
                  <p className="text-gray-500 text-sm">
                    <a href="tel:+237693264991" className="hover:text-crimson transition-colors">+237 693 26 49 91</a>
                  </p>
                  <p className="text-gray-500 text-sm">
                    <a href="tel:+237688339800" className="hover:text-crimson transition-colors">+237 6 88 33 98 00</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">WhatsApp</h3>
                  <a
                    href="https://wa.me/237693264991?text=Bonjour%20Chez%20GuiGui%20!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm font-medium hover:underline"
                  >
                    Discuter sur WhatsApp →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-crimson" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Email</h3>
                  <a href="mailto:contact@guigui.cm" className="text-gray-500 text-sm hover:text-crimson transition-colors">
                    contact@guigui.cm
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-crimson" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">Horaires</h3>
                  <p className="text-gray-500 text-sm">Lundi – Dimanche</p>
                  <p className="text-gray-500 text-sm">8h00 – 20h00</p>
                </div>
              </div>
            </div>

            {/* Encart WhatsApp CTA */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-green-800 font-semibold mb-2">📱 Commande rapide par WhatsApp</p>
              <p className="text-green-700 text-sm mb-3">
                Pour une commande spéciale (gâteau d'anniversaire, événement, etc.),
                contactez-nous directement sur WhatsApp pour un devis rapide.
              </p>
              <a
                href="https://wa.me/237693264991?text=Bonjour%20Chez%20GuiGui%20!%20Je%20souhaite%20passer%20une%20commande%20spéciale."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <FiMessageCircle size={16} />
                Ouvrir WhatsApp
              </a>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-card shadow-card p-6 md:p-8">
              <h2 className="text-2xl font-bold text-dark mb-6">Envoyez-nous un message</h2>

              {sent ? (
                <div className="text-center py-12">
                  <FiCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold text-dark mb-2">Message envoyé !</h3>
                  <p className="text-gray-500 mb-6">
                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="text-crimson font-medium hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet <span className="text-crimson">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="6XX XXX XXX"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Sujet
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-colors"
                      >
                        <option value="">Choisir un sujet</option>
                        <option value="commande">Question sur une commande</option>
                        <option value="commande_speciale">Commande spéciale / Événement</option>
                        <option value="livraison">Livraison</option>
                        <option value="reclamation">Réclamation</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-crimson">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-crimson text-white px-8 py-3 rounded-full font-semibold hover:bg-crimson/90 disabled:opacity-50 transition-colors"
                  >
                    {sending ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <FiSend size={16} />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
