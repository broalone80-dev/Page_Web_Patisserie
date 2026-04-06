import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { productService, categoryService } from '@services/api';
import { Product } from '@types/index';
import { ProductCard } from '@components/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: CategoryInfo[];
  productCount?: number;
}

// Maps footer labels to category slugs
const COLLECTION_MAP: Record<string, { title: string; description: string; slugs: string[] }> = {
  'cupcakes-gateaux': {
    title: 'Cupcakes & Gâteaux',
    description: 'Nos cakes, beignets, crêpes sucrées et douceurs artisanales.',
    slugs: ['pause-sucree', 'cakes', 'crepes-sucrees', 'beignets', 'desserts'],
  },
  'sales-street-food': {
    title: 'Salés & Street Food',
    description: 'Pastels, crêpes salées, gaufres garnies et mini ardoises pour tous vos événements.',
    slugs: ['pause-salee', 'crepes-salees', 'gaufres-salees', 'pastels', 'mini-ardoises'],
  },
  'boissons': {
    title: 'Boissons Fraîches',
    description: 'Yaourts artisanaux et boissons fraîches maison.',
    slugs: ['yaourts-boissons'],
  },
  'coffrets': {
    title: 'Nos Coffrets',
    description: 'Lots et coffrets gourmands, parfaits pour les événements et les cadeaux.',
    slugs: [], // Special: filter by metadata.quantity
  },
  'promotions': {
    title: 'Promotions',
    description: 'Nos best sellers et produits phares du moment.',
    slugs: [], // Special: filter by isFeatured
  },
};

export default function Products() {
  const router = useRouter();
  const { category, collection, search } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Nos Produits');
  const [pageDescription, setPageDescription] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories for sidebar
        const catRes = await categoryService.getAll();
        const cats: CategoryInfo[] = catRes.data?.categories || [];
        setAllCategories(cats);

        // Search query takes priority
        if (search && typeof search === 'string') {
          setPageTitle(`Recherche : "${search}"`);
          setPageDescription('');
          const res = await productService.getAll(1, 100, search);
          setProducts(res.data?.products || []);
        } else if (collection === 'promotions') {
          // Featured products
          setPageTitle('Promotions');
          setPageDescription('Nos best sellers et produits phares du moment.');
          const res = await productService.getFeatured();
          setProducts(res.data?.products || []);
        } else if (collection && COLLECTION_MAP[collection as string]) {
          // Collection-based filtering
          const col = COLLECTION_MAP[collection as string];
          setPageTitle(col.title);
          setPageDescription(col.description);

          if (collection === 'coffrets') {
            // Get all products, filter lots
            const res = await productService.getAll(1, 100);
            const all = res.data?.products || [];
            setProducts(all.filter((p: any) => {
              const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata;
              return meta?.quantity && meta.quantity >= 5;
            }));
          } else {
            // Get all products, filter by category slugs
            const res = await productService.getAll(1, 100);
            const all = res.data?.products || [];
            const matchSlugs = col.slugs;
            setProducts(all.filter((p: any) =>
              p.categories?.some((pc: any) => matchSlugs.includes(pc.category?.slug))
            ));
          }
        } else if (category) {
          // Single category filter
          const matchedCat = cats.find((c: CategoryInfo) => c.slug === category);
          if (matchedCat) {
            setPageTitle(matchedCat.name);
            setPageDescription('');
            // Get child slugs too
            const childSlugs = (matchedCat.children || []).map((c: CategoryInfo) => c.slug);
            const allSlugs = [matchedCat.slug, ...childSlugs];

            const res = await productService.getAll(1, 100);
            const all = res.data?.products || [];
            setProducts(all.filter((p: any) =>
              p.categories?.some((pc: any) => allSlugs.includes(pc.category?.slug))
            ));
          } else {
            setPageTitle('Nos Produits');
            const res = await productService.getAll(1, 100);
            setProducts(res.data?.products || []);
          }
        } else {
          // All products
          setPageTitle('Nos Produits');
          const res = await productService.getAll(1, 100);
          setProducts(res.data?.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, category, collection, search]);

  // Parent categories for sidebar
  const parentCategories = allCategories.filter(c => !c.parentId);

  return (
    <>
      <Head>
        <title>{`${pageTitle} - Chez GuiGui`}</title>
      </Head>

      <div className="container-custom py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-crimson transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-crimson transition-colors">Boutique</Link>
          {(category || collection) && (
            <>
              <span>/</span>
              <span className="text-dark font-medium">{pageTitle}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200 shadow-sm text-sm font-medium text-stone-700 hover:border-crimson transition-colors w-fit"
          >
            <FiFilter size={16} /> Filtrer par catégorie
          </button>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-dark text-sm uppercase tracking-wider">Catégories</h3>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-400 hover:text-crimson">
                    <FiX size={20} />
                  </button>
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link href="/products" onClick={() => setSidebarOpen(false)}
                      className={`block text-sm py-1.5 px-3 rounded transition-colors ${!category && !collection ? 'bg-crimson text-white' : 'text-gray-600 hover:text-crimson hover:bg-crimson/5'}`}>
                      Tous les produits
                    </Link>
                  </li>
                  {parentCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/products?category=${cat.slug}`} onClick={() => setSidebarOpen(false)}
                        className={`block text-sm py-1.5 px-3 rounded transition-colors ${category === cat.slug ? 'bg-crimson text-white' : 'text-gray-600 hover:text-crimson hover:bg-crimson/5'}`}>
                        {cat.name}
                        {cat.productCount !== undefined && <span className="ml-1 text-xs opacity-60">({cat.productCount})</span>}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t pt-2 mt-2">
                    <Link href="/products?collection=promotions" onClick={() => setSidebarOpen(false)}
                      className={`block text-sm py-1.5 px-3 rounded transition-colors ${collection === 'promotions' ? 'bg-crimson text-white' : 'text-crimson font-medium hover:bg-crimson/5'}`}>
                      ⭐ Promotions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-card shadow-card p-5 sticky top-24">
              <h3 className="font-semibold text-dark mb-4 text-sm uppercase tracking-wider">Catégories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`block text-sm py-1.5 px-3 rounded transition-colors ${
                      !category && !collection ? 'bg-crimson text-white' : 'text-gray-600 hover:text-crimson hover:bg-crimson/5'
                    }`}
                  >
                    Tous les produits
                  </Link>
                </li>
                {parentCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block text-sm py-1.5 px-3 rounded transition-colors ${
                        category === cat.slug ? 'bg-crimson text-white' : 'text-gray-600 hover:text-crimson hover:bg-crimson/5'
                      }`}
                    >
                      {cat.name}
                      {cat.productCount !== undefined && (
                        <span className="ml-1 text-xs opacity-60">({cat.productCount})</span>
                      )}
                    </Link>
                  </li>
                ))}
                <li className="border-t pt-2 mt-2">
                  <Link
                    href="/products?collection=promotions"
                    className={`block text-sm py-1.5 px-3 rounded transition-colors ${
                      collection === 'promotions' ? 'bg-crimson text-white' : 'text-crimson font-medium hover:bg-crimson/5'
                    }`}
                  >
                    ⭐ Promotions
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-dark">{pageTitle}</h1>
              {pageDescription && <p className="text-gray-500 text-sm mt-1">{pageDescription}</p>}
              {!loading && <p className="text-gray-400 text-xs mt-2">{products.length} produit{products.length !== 1 ? 's' : ''}</p>}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-card shadow-card overflow-hidden animate-pulse">
                    <div className="h-44 sm:h-52 bg-gray-200" />
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-400 mb-4">Aucun produit dans cette catégorie</p>
                <Link href="/products" className="btn-primary-outline">
                  Voir tous les produits
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
