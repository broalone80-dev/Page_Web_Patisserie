import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authService } from '@services/api';
import { useAuthStore } from '@lib/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      if (user.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion – GuiGui Pâtisserie</title>
        <meta name="description" content="Connectez-vous à votre compte GuiGui Pâtisserie" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-serif font-bold text-crimson-700">
                GuiGui
              </h1>
              <p className="text-sm text-stone-500 mt-1">Pause sucrée & salée</p>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
              Connexion
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-stone-600">
                  <input type="checkbox" className="mr-2 rounded border-stone-300 text-crimson-600 focus:ring-crimson-500" />
                  Se souvenir de moi
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-crimson-600 hover:text-crimson-800 font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-crimson-200 hover:shadow-crimson-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="text-crimson-600 hover:text-crimson-800 font-semibold">
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
