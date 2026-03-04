import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authService } from '@services/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token as string, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Réinitialiser le mot de passe – GuiGui Pâtisserie</title>
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
                        {success ? (
                            <div className="text-center py-6">
                                <div className="text-5xl mb-4">✅</div>
                                <h2 className="text-xl font-bold text-stone-800 mb-3">Mot de passe réinitialisé !</h2>
                                <p className="text-stone-600 mb-6">
                                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                                </p>
                                <Link
                                    href="/auth/login"
                                    className="inline-block px-6 py-3 bg-crimson-600 text-white rounded-xl font-semibold hover:bg-crimson-700 transition-colors"
                                >
                                    Se connecter
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
                                    Nouveau mot de passe
                                </h2>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                                            placeholder="8 caractères min, 1 majuscule, 1 chiffre"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirm" className="block text-sm font-medium text-stone-700 mb-1.5">
                                            Confirmer
                                        </label>
                                        <input
                                            id="confirm"
                                            type="password"
                                            required
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all outline-none text-stone-800"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !token}
                                        className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-crimson-200"
                                    >
                                        {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
