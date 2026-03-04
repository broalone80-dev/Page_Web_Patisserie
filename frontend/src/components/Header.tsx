import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@lib/authStore';
import { authService } from '@services/api';
import { useRouter } from 'next/router';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser } from 'react-icons/fi';

export const Header: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Boutique' },
    { href: '#about', label: 'À propos' },
    { href: '#contact', label: 'Contact' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <header className="bg-white shadow-header sticky top-0 z-50">
      <nav className="container-custom flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="GuiGui - Accueil">
          <Image
            src="/logo.svg"
            alt="GuiGui - Pause sucrée et salée"
            width={120}
            height={50}
            className="h-10 md:h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 relative
                ${isActive(link.href)
                  ? 'text-crimson after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-crimson'
                  : 'text-dark hover:text-crimson'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            {searchOpen ? (
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent border-none outline-none text-sm w-40 placeholder-gray-400"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                  aria-label="Rechercher un produit"
                />
                <FiSearch className="text-gray-400 ml-2" size={16} />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-dark hover:text-crimson transition-colors"
                aria-label="Ouvrir la recherche"
              >
                <FiSearch size={20} />
              </button>
            )}
          </div>

          {/* User / Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/orders" className="text-sm text-dark hover:text-crimson transition-colors">
                Commandes
              </Link>
              {user.isAdmin && (
                <Link href="/admin/dashboard" className="text-sm font-semibold text-crimson hover:text-crimson-dark transition-colors">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-crimson transition-colors"
                aria-label="Se déconnecter"
              >
                <FiUser size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:flex p-2 text-dark hover:text-crimson transition-colors"
              aria-label="Se connecter"
            >
              <FiUser size={20} />
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-dark hover:text-crimson transition-colors"
            aria-label="Panier"
          >
            <FiShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-crimson text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-dark hover:text-crimson transition-colors"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl md:hidden animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b">
              <Image
                src="/logo.svg"
                alt="GuiGui"
                width={100}
                height={40}
                className="h-8 w-auto"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-dark hover:text-crimson"
                aria-label="Fermer le menu"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-4 py-3">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch className="text-gray-400 mr-2" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
                  aria-label="Rechercher un produit"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-sm font-medium border-b border-gray-100 transition-colors
                    ${isActive(link.href) ? 'text-crimson' : 'text-dark hover:text-crimson'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth */}
            <div className="px-4 pt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/orders"
                    className="block py-3 text-sm font-medium border-b border-gray-100 text-dark hover:text-crimson transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📦 Mes commandes
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block py-3 text-sm font-semibold text-crimson border-b border-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚙️ Administration
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="btn-primary w-full justify-center mt-2"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login" className="btn-primary justify-center text-center" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="btn-primary-outline justify-center text-center" onClick={() => setMobileMenuOpen(false)}>
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
