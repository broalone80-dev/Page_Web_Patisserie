import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, productService, categoryService, uploadService } from '@services/api';
import { useAuthStore } from '@lib/authStore';
import { formatPrice } from '@lib/utils';
import { AdminLayout } from '@components/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiUpload, FiStar, FiArrowLeft, FiSearch } from 'react-icons/fi';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: { id: string; url: string; altText: string }[];
  categories: { category: { id: string; name: string; slug: string } }[];
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export default function AdminProducts() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceCents: 0,
    stock: 50,
    isActive: true,
    isFeatured: false,
    categoryIds: [] as string[],
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminService.getProducts(1, 200),
        categoryService.getAll(),
      ]);
      setProducts(prodRes.data?.products || []);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      priceCents: 0,
      stock: 50,
      isActive: true,
      isFeatured: false,
      categoryIds: [],
    });
    setShowForm(true);
  };

  const openEditForm = (product: ProductItem) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      categoryIds: product.categories.map((c) => c.category.id),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || form.priceCents <= 0) {
      alert('Remplissez le nom, slug et un prix valide.');
      return;
    }
    setSaving(true);
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, form);
      } else {
        await adminService.createProduct(form);
      }
      setShowForm(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteProduct(id);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleFeatured = async (product: ProductItem) => {
    try {
      await adminService.updateProduct(product.id, { isFeatured: !product.isFeatured });
      await fetchData();
    } catch (err) {
      console.error('Toggle featured error:', err);
    }
  };

  const handleToggleActive = async (product: ProductItem) => {
    try {
      await adminService.updateProduct(product.id, { isActive: !product.isActive });
      await fetchData();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleImageUpload = async (productId: string, files: FileList) => {
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadService.uploadSingle(files[i], 'products');
        const imageData = res.data || res;
        await adminService.addProductImages(productId, [{
          url: imageData.url || imageData.secure_url,
          publicId: imageData.publicId || imageData.public_id || '',
          altText: '',
          position: i,
        }]);
      }
      await fetchData();
    } catch (err: any) {
      alert('Erreur upload : ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.includes(search.toLowerCase())
  );

  // Sub-categories only for the form
  const subCategories = categories.filter((c) => c.parentId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-12 w-12 border-4 border-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Gestion Produits – Admin GuiGui</title>
      </Head>

      <div className="min-h-screen bg-stone-50">
        <AdminLayout title="Gestion des Produits">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-stone-500">{products.length} produits au catalogue</p>
            <button onClick={openCreateForm} className="flex items-center gap-2 bg-crimson text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crimson/90 transition-colors">
              <FiPlus size={16} /> Nouveau produit
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-6 bg-white rounded-lg shadow-sm border border-stone-200 px-4 py-2">
            <FiSearch className="text-stone-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <span className="text-xs text-stone-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Photo</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Produit</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Prix</th>
                    <th className="text-center px-4 py-3 text-stone-600 font-medium">Stock</th>
                    <th className="text-center px-4 py-3 text-stone-600 font-medium">Actif</th>
                    <th className="text-center px-4 py-3 text-stone-600 font-medium">Promo</th>
                    <th className="text-right px-4 py-3 text-stone-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((product) => (
                    <tr key={product.id} className={`hover:bg-stone-50 transition-colors ${!product.isActive ? 'opacity-50' : ''}`}>
                      {/* Photo */}
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors">
                              <FiUpload className="text-stone-400" size={14} />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files && handleImageUpload(product.id, e.target.files)}
                              />
                            </label>
                          )}
                        </div>
                      </td>
                      {/* Product info */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-stone-400 truncate max-w-[200px]">{product.categories.map(c => c.category.name).join(', ')}</p>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-stone-700 whitespace-nowrap">
                        {formatPrice(product.priceCents)}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock}
                        </span>
                      </td>
                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${product.isActive ? 'bg-green-500' : 'bg-stone-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${product.isActive ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      {/* Featured/Promo toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          title={product.isFeatured ? 'Retirer des promos' : 'Mettre en promo'}
                          className={`p-1.5 rounded transition-colors ${product.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-amber-400'}`}
                        >
                          <FiStar size={16} fill={product.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Upload photo */}
                          <label className="p-1.5 text-stone-400 hover:text-blue-600 cursor-pointer transition-colors" title="Ajouter photo">
                            <FiUpload size={15} />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => e.target.files && handleImageUpload(product.id, e.target.files)}
                            />
                          </label>
                          <button onClick={() => openEditForm(product)} className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors" title="Modifier">
                            <FiEdit2 size={15} />
                          </button>
                          {deleteConfirm === product.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(product.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Oui</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-stone-200 px-2 py-1 rounded">Non</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 text-stone-400 hover:text-red-600 transition-colors" title="Supprimer">
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AdminLayout>

        {/* Product Form Modal */}
        {showForm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-stone-800">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nom du produit</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({ ...f, name, slug: editingProduct ? f.slug : generateSlug(name) }));
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-crimson focus:border-crimson outline-none"
                    placeholder="Ex: Cake au Chocolat"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-crimson focus:border-crimson outline-none"
                    placeholder="cake-chocolat"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-crimson focus:border-crimson outline-none resize-none"
                    placeholder="Description du produit..."
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Prix (FCFA)</label>
                    <input
                      type="number"
                      value={form.priceCents / 100}
                      onChange={(e) => setForm((f) => ({ ...f, priceCents: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
                      min={0}
                      step={100}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-crimson focus:border-crimson outline-none"
                      placeholder="3000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                      min={0}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-crimson focus:border-crimson outline-none"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Catégories</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-stone-200 rounded-lg p-3">
                    {subCategories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.categoryIds.includes(cat.id)}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              categoryIds: e.target.checked
                                ? [...f.categoryIds, cat.id]
                                : f.categoryIds.filter((id) => id !== cat.id),
                            }));
                          }}
                          className="rounded border-stone-300 text-crimson focus:ring-crimson"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="rounded border-stone-300 text-crimson focus:ring-crimson"
                    />
                    <span className="text-sm text-stone-700">Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      className="rounded border-stone-300 text-crimson focus:ring-crimson"
                    />
                    <span className="text-sm text-stone-700">⭐ Promo / Best seller</span>
                  </label>
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-crimson text-white py-3 rounded-lg font-medium hover:bg-crimson/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </div>
          </>
        )}

        {uploading && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
              <div className="animate-spin h-6 w-6 border-3 border-crimson border-t-transparent rounded-full" />
              <span className="text-sm font-medium">Upload en cours...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
