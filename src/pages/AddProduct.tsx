import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ImagePlus, LoaderCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { searchCatalog } from '../api/catalog';
import { createSellerProduct, loadSellerGames } from '../api/seller';
import type { CatalogProduct } from '../types/catalog';
import type { CardGameOption, SellerProductInput } from '../types/seller';

const initialForm: SellerProductInput = {
  name: '', game: '', type: 'Single', cost: 0, price: 0, stock: 0,
  imageUrl: null, productSet: '', language: 'English', description: '', templateProductId: null,
};

const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

const AddProduct = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<SellerProductInput>(initialForm);
  const [games, setGames] = useState<CardGameOption[]>([]);
  const [matches, setMatches] = useState<CatalogProduct[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const templateSelected = form.templateProductId != null;

  useEffect(() => {
    let cancelled = false;
    loadSellerGames()
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
          if (!cancelled) setMatches(products.filter((product) => normalize(product.name).includes(normalize(query))).slice(0, 8));
        })
        .catch((requestError: unknown) => {
          if (!cancelled) setSearchError(requestError instanceof Error ? requestError.message : 'Could not check existing listings.');
        })
        .finally(() => { if (!cancelled) setIsSearching(false); });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.name]);

  const update = (key: keyof SellerProductInput, value: string | number | null) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'name') setError(null);
  };

  const exactMatches = form.game
    ? matches.filter((product) => normalize(product.name) === normalize(form.name)
      && product.type === form.type
      && normalize(product.game) === normalize(form.game))
    : [];
  const officialMatch = exactMatches.some((product) => product.source === 'OFFICIAL');
  const marketplaceMatches = exactMatches.filter((product) => product.source === 'MARKETPLACE');

  const selectTemplate = (product: CatalogProduct) => {
    if (product.source !== 'MARKETPLACE') return;
    setForm((current) => ({
      ...current,
      templateProductId: product.id,
      name: product.name,
      game: product.game,
      type: product.type,
      productSet: product.productSet ?? '',
      language: product.language ?? '',
      imageUrl: product.imageUrl,
    }));
    setError(null);
  };

  const clearTemplate = () => {
    setForm((current) => ({
      ...current,
      templateProductId: null,
      name: '',
      game: '',
      type: 'Single',
      productSet: '',
      language: 'English',
      imageUrl: null,
    }));
    setError(null);
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => update('imageUrl', String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (officialMatch) {
      setError('This product is already sold by Optracard Official Store and cannot be listed on Marketplace.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createSellerProduct(form);
      navigate('/seller');
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit product.');
    } finally {
      setIsSaving(false);
    }
  };

  const input = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100 disabled:text-slate-500';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar currentTab="stocks" />
      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <button type="button" onClick={() => navigate('/seller')} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back to Stocks
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Marketplace listing</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Add new product</h1>
            <p className="mt-2 text-sm text-slate-500">Choose an approved Marketplace product to reuse its details, or enter a completely new product for Admin review.</p>
            {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={submit} className="mt-8 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold">
                  <span className="flex items-center justify-between gap-3">
                    <span>Product name</span>
                    {templateSelected && <button type="button" onClick={clearTemplate} className="text-xs font-bold text-blue-600 hover:text-blue-700">Choose another / new product</button>}
                  </span>
                  <input required value={form.name} readOnly={templateSelected} onChange={(event) => update('name', event.target.value)} className={input} placeholder="e.g. One Piece PRB-01 The Best Booster" />
                </label>
                <label className="text-sm font-semibold">
                  Card game
                  <select required value={form.game} onChange={(event) => update('game', event.target.value)} className={input} disabled={isLoadingGames || templateSelected}>
                    <option value="">{isLoadingGames ? 'Loading card games...' : 'Select a card game'}</option>
                    {games.map((game) => <option key={game.id} value={game.name}>{game.name}</option>)}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Choose from games supported by Optracard.</span>
                </label>
              </div>

              {form.name.trim().length >= 2 && (
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">Existing Marketplace products</h2>
                    {isSearching && <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Only approved and active Marketplace listings can be selected as a template. You can still continue with a new product if there is no suitable match.</p>
                  {searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}
                  {!isSearching && !searchError && matches.length === 0 && <p className="mt-3 text-sm text-slate-500">No matching products found. Continue below to submit a new product.</p>}
                  {officialMatch && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <span>This exact product is already sold by Optracard Official Store and cannot be listed on Marketplace.</span>
                    </div>
                  )}
                  {!officialMatch && marketplaceMatches.length > 0 && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600" />
                      <span>This product is already sold by {marketplaceMatches.length} Marketplace shop{marketplaceMatches.length === 1 ? '' : 's'}. You may select one as a template or continue with a new listing.</span>
                    </div>
                  )}
                  {matches.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {matches.map((product) => (
                        <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.game} · {product.type} · {product.store.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${product.source === 'OFFICIAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {product.source === 'OFFICIAL' ? 'Official Store' : `฿${product.price.toLocaleString()}`}
                            </span>
                            {product.source === 'MARKETPLACE' && (
                              <button type="button" onClick={() => selectTemplate(product)} disabled={form.templateProductId === product.id} className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500">
                                {form.templateProductId === product.id ? 'Selected template' : 'Use this product'}
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
                <label className="text-sm font-semibold">Product type<select value={form.type} onChange={(event) => update('type', event.target.value)} className={input} disabled={templateSelected}><option>Single</option><option>Booster</option><option>Booster Box</option><option>Accessories</option></select></label>
                <label className="text-sm font-semibold">Language<select value={form.language ?? ''} onChange={(event) => update('language', event.target.value)} className={input} disabled={templateSelected}><option>English</option><option>Japanese</option><option>Thai</option><option>Korean</option><option>Chinese</option></select></label>
                <label className="text-sm font-semibold">Set<input value={form.productSet ?? ''} readOnly={templateSelected} onChange={(event) => update('productSet', event.target.value)} className={input} placeholder="Set name / code" /></label>
                <label className="text-sm font-semibold">Stock<input required min="0" type="number" value={form.stock} onChange={(event) => update('stock', Number(event.target.value))} className={input} /></label>
                <label className="text-sm font-semibold">Cost price (฿)<input required min="0" step="0.01" type="number" value={form.cost} onChange={(event) => update('cost', Number(event.target.value))} className={input} /></label>
                <label className="text-sm font-semibold">Selling price (฿)<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => update('price', Number(event.target.value))} className={input} /></label>
              </div>

              <label className="block text-sm font-semibold">Description<textarea rows={5} value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} className={input} placeholder="Describe condition, contents, or important details" /></label>
              <div>
                <p className="text-sm font-semibold">Product image</p>
                <div className="mt-2 flex items-center gap-4">
                  <button type="button" disabled={templateSelected} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"><ImagePlus className="h-4 w-4" />{templateSelected ? 'Using template image' : 'Choose image'}</button>
                  <input ref={fileRef} type="file" accept="image/*" disabled={templateSelected} onChange={(event) => loadImage(event.target.files?.[0])} className="hidden" />
                  {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-20 w-16 rounded object-cover ring-1 ring-slate-200" />}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => navigate('/seller')} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold cursor-pointer">Cancel</button>
                <button disabled={isSaving || isLoadingGames || officialMatch} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer">{isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}Submit for approval</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
