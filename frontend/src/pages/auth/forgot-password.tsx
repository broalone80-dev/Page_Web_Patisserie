import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { authService } from '@services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Mot de passe oublié – GuiGui Pâtisserie</title>
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
                        {sent ? (
                            <div className="text-center py-6">
                                <div className="text-5xl mb-4">📧</div>
                                <h2 className="text-xl font-bold text-stone-800 mb-3">Email envoyé !</h2>
                                <p className="text-stone-600 mb-6">
                                    Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.
                                    Vérifiez votre boîte de réception.
                                </p>
                                <Link href="/auth/login" className="text-crimson-600 hover:text-crimson-800 font-semibold">
                                    ← Retour à la connexion
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
                                    Mot de passe oublié ?
                                </h2>
                                <p className="text-stone-500 text-center text-sm mb-6">
                                    Entrez votre email et nous vous enverrons un lien de réinitialisation.
                                </p>

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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-crimson-200"
                                    >
                                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href="/auth/login" className="text-sm text-crimson-600 hover:text-crimson-800 font-medium">
                                        ← Retour à la connexion
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
