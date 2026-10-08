import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Link as LinkIcon, LoaderCircle, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createAdminProduct, loadAdminCardGames } from '../api/admin';
import { searchCatalog } from '../api/catalog';
import { AdminWorkspace } from '../components/AdminWorkspace';
import type { CatalogProduct } from '../types/catalog';
import type { AdminCardGame, AdminProductInput } from '../types/admin';

const initialForm: AdminProductInput = {
  name: '', game: '', type: 'Single Card', cost: 0, price: 0, stock: 0,
  imageUrl: null, productSet: null, language: null, description: null,
};

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

export const ADaddProduct = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AdminProductInput>(initialForm);
  const [games, setGames] = useState<AdminCardGame[]>([]);
  const [matches, setMatches] = useState<CatalogProduct[]>([]);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminCardGames()
      .then((loadedGames) => { if (!cancelled) setGames(loadedGames); })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not load card games.');
      })
      .finally(() => { if (!cancelled) setIsLoadingGames(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const query = form.name.trim();
    if (query.length < 2) {
      setMatches([]);
      setSearchError(null);
      setIsSearching(false);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);
      searchCatalog(query)
        .then((products) => {
          if (!cancelled) {
            setMatches(products.filter((product) => normalize(product.name).includes(normalize(query))).slice(0, 8));
          }
        })
        .catch((requestError: unknown) => {
          if (!cancelled) setSearchError(requestError instanceof Error ? requestError.message : 'Could not check catalog templates.');
        })
        .finally(() => { if (!cancelled) setIsSearching(false); });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.name]);

  const update = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'name' || key === 'game' || key === 'type') {
      setTemplateId(null);
      setError(null);
    }
  };

  const selectTemplate = (product: CatalogProduct) => {
    if (product.source !== 'MARKETPLACE') return;
    setTemplateId(product.id);
    setForm((current) => ({
      ...current,
      name: product.name,
      game: product.game,
      type: product.type,
      imageUrl: product.imageUrl,
      productSet: product.productSet,
      language: product.language,
      description: product.description,
    }));
    setError(null);
  };

  const clearTemplate = () => {
    setTemplateId(null);
    setForm(initialForm);
    setError(null);
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('imageUrl', String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createAdminProduct(form);
      navigate(`/admin/products/${created.id}`, { replace: true });
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const input = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';
  const exactMatches = form.game
    ? matches.filter((product) => normalize(product.name) === normalize(form.name)
      && product.type === form.type
      && normalize(product.game) === normalize(form.game))
    : [];

  return (
    <AdminWorkspace currentTab="stocks">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate('/admin/stocks')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stocks
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Official Store Catalog</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Add new product</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create a new official product, or reuse the identity and image details of an existing Marketplace listing.
          </p>

          {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                <span className="flex items-center justify-between gap-3">
                  <span>Product name</span>
                  {templateId && (
                    <button type="button" onClick={clearTemplate} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                      Choose another / new product
                    </button>
                  )}
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  className={input}
                  placeholder="e.g. One Piece PRB-01 The Best Booster"
                />
              </label>
              <label className="text-sm font-semibold">
                Card game
                <select
                  required
                  value={form.game}
                  onChange={(event) => update('game', event.target.value)}
                  className={input}
                  disabled={isLoadingGames}
                >
                  <option value="">{isLoadingGames ? 'Loading card games...' : 'Select a card game'}</option>
                  {games.map((game) => <option key={game.id} value={game.name}>{game.name}</option>)}
                </select>
              </label>
            </div>

            {form.name.trim().length >= 2 && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Existing catalog products</h2>
                  {isSearching && <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Official Store listings are shown for reference only. You may use a Marketplace listing as a template; its stock, cost price, and selling price are never copied.
                </p>
                {searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}
                {!isSearching && !searchError && matches.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">No matching products found. Continue below to create a new product.</p>
                )}
                {exactMatches.length > 0 && (
                  <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    A matching product already exists in the catalog. Official Store rows are reference-only; Marketplace rows may be used as templates.
                  </p>
                )}
                {matches.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {matches.map((product) => (
                      <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-12 w-10 rounded border border-slate-200 bg-slate-100 object-cover" />
                          ) : (
                            <div className="h-12 w-10 rounded border border-slate-200 bg-slate-100" />
                          )}
                          <div className="min-w-0 text-sm">
                            <p className="truncate font-semibold text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.game} · {product.type} · {product.store.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.source === 'OFFICIAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {product.source === 'OFFICIAL' ? 'Official Store · Already in catalog' : 'Marketplace'}
                          </span>
                          {product.source === 'MARKETPLACE' && (
                            <button
                              type="button"
                              onClick={() => selectTemplate(product)}
                              disabled={templateId === product.id}
                              className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                            >
                              {templateId === product.id ? 'Selected template' : 'Use this product'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Product type
                <input required value={form.type} onChange={(event) => update('type', event.target.value)} className={input} />
              </label>
              <label className="text-sm font-semibold">
                Language
                <input value={form.language ?? ''} onChange={(event) => update('language', event.target.value || null)} className={input} placeholder="e.g. Japanese" />
              </label>
              <label className="text-sm font-semibold">
                Set
                <input value={form.productSet ?? ''} onChange={(event) => update('productSet', event.target.value || null)} className={input} placeholder="Set name / code" />
              </label>
              <label className="text-sm font-semibold">
                Stock
                <input required min="0" type="number" value={form.stock} onChange={(event) => update('stock', Number(event.target.value))} className={input} />
              </label>
              <label className="text-sm font-semibold">
                Cost price (฿)
                <input required min="0" step="0.01" type="number" value={form.cost} onChange={(event) => update('cost', Number(event.target.value))} className={input} />
              </label>
              <label className="text-sm font-semibold">
                Selling price (฿)
                <input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => update('price', Number(event.target.value))} className={input} />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              Description
              <textarea rows={5} value={form.description ?? ''} onChange={(event) => update('description', event.target.value || null)} className={input} placeholder="Describe condition, contents, or important details" />
            </label>

            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Product image</h2>
                  <p className="mt-1 text-xs font-normal text-slate-500">Upload an image or paste an Image URL. The saved image is previewed here.</p>
                </div>
                {form.imageUrl && (
                  <button type="button" onClick={() => update('imageUrl', null)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                    Remove image
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                <div className="flex h-36 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Product preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-7 w-7 text-slate-300" />
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Choose image
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} className="hidden" />
                  <label className="block text-sm font-semibold">
                    <span className="flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5" />Image URL</span>
                    <input value={form.imageUrl ?? ''} onChange={(event) => update('imageUrl', event.target.value || null)} placeholder="https://…" className={input} />
                  </label>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button type="button" onClick={() => navigate('/admin/stocks')} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold cursor-pointer">
                Cancel
              </button>
              <button disabled={submitting || isLoadingGames} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer">
                {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Create Official Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminWorkspace>
  );
};

export default ADaddProduct;
