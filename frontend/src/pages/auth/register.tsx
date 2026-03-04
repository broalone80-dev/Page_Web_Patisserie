import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authService } from '@services/api';
import { useAuthStore } from '@lib/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.fullName || undefined,
        formData.phone || undefined
      );
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      router.push('/');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.map((e: any) => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Erreur d\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription – GuiGui Pâtisserie</title>
        <meta name="description" content="Créez votre compte GuiGui Pâtisserie" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-serif font-bold text-crimson-700">GuiGui</h1>
              <p className="text-sm text-stone-500 mt-1">Pause sucrée & salée</p>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
              Créer un compte
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nom complet
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Téléphone (Cameroun)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Mot de passe *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="8 caractères min, 1 majuscule, 1 chiffre"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Confirmer le mot de passe *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-crimson-200 hover:shadow-crimson-300 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Inscription...
                  </span>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500">
                Déjà un compte ?{' '}
                <Link href="/auth/login" className="text-crimson-600 hover:text-crimson-800 font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
