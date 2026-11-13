import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarClock, ImagePlus, Link as LinkIcon, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOfficialAuction, createSellerAuction, loadSellerAuctions, updateSellerAuction } from '../api/auctions';
import { loadAdminCardGames } from '../api/admin';
import { loadSellerGames } from '../api/seller';
import type { AuctionInput } from '../types/auction';
import type { CardGameOption } from '../types/seller';
import Sidebar from '../components/Sidebar';
import { ADsidebar } from '../components/ADsidebar';

const dateValue = (value?: string) => value ? value.slice(0, 16) : '';
const emptyForm: AuctionInput = { productId: null, title: '', gameId: null, type: 'Single', productSet: '', language: 'English', imageUrl: '', description: '', startingPrice: 0, bidIncrement: 50, startsAt: '', endsAt: '', cardCondition: '', grading: '', evidenceImages: [] };
const control = 'mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-slate-100';

export const AuctionForm = ({ official = false }: { official?: boolean }) => {
  const { id } = useParams();
  const auctionId = Number(id);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [games, setGames] = useState<CardGameOption[]>([]);
  const [form, setForm] = useState<AuctionInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    let active = true;
    const loadGames = official ? loadAdminCardGames : loadSellerGames;
    void loadGames().then((loadedGames) => { if (active) setGames(loadedGames); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load card games.'); })
      .finally(() => { if (active) setLoadingGames(false); });
    return () => { active = false; };
  }, [official]);

  useEffect(() => {
    if (official || !Number.isInteger(auctionId)) return;
    let active = true;
    void loadSellerAuctions().then((auctions) => {
      const auction = auctions.find((item) => item.id === auctionId);
      if (!auction) throw new Error('Auction not found.');
      if (!['DRAFT', 'PENDING_REVIEW', 'REJECTED'].includes(auction.status)) throw new Error('This auction is locked and cannot be edited.');
      if (!active) return;
      setForm({ productId: null, cardCondition: auction.cardCondition ?? '', grading: auction.grading ?? '', evidenceImages: auction.evidenceImages ?? [], title: auction.title, gameId: games.find((game) => game.name === auction.game)?.id ?? null, type: auction.type ?? 'Single', productSet: auction.productSet ?? '', language: auction.language ?? '', imageUrl: auction.imageUrl ?? '', description: auction.description ?? '', startingPrice: auction.startingPrice, bidIncrement: auction.bidIncrement ?? 50, startsAt: dateValue(auction.startsAt), endsAt: dateValue(auction.endsAt) });
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load auction.'); });
    return () => { active = false; };
  }, [auctionId, games, official]);

  const update = <K extends keyof AuctionInput>(key: K, value: AuctionInput[K]) => { setError(null); setForm((current) => ({ ...current, [key]: value })); };
  const loadImage = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => update('imageUrl', String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.gameId) { setError('Select a supported card game.'); return; }
    const payload: AuctionInput = { ...form, productId: null, evidenceImages: (form.evidenceImages ?? []).map((value) => value.trim()).filter(Boolean) };
    setSaving(true); setError(null);
    try {
      if (official) { await createOfficialAuction(payload); navigate('/admin/auctions'); }
      else if (Number.isInteger(auctionId)) { await updateSellerAuction(auctionId, payload); navigate('/seller/auctions'); }
      else { await createSellerAuction(payload); navigate('/seller/auctions'); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save auction.'); }
    finally { setSaving(false); }
  };

  const back = official ? '/admin/auctions' : '/seller/auctions';
  const action = official ? 'Publish official auction' : Number.isInteger(auctionId) ? 'Save auction changes' : 'Save draft';
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {official ? <ADsidebar currentTab="auctions" /> : <Sidebar currentTab="auctions" />}
      <main className="min-w-0 flex-1 p-6 pt-24 lg:p-8 lg:pt-24">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={() => navigate(back)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600"><ArrowLeft className="h-4 w-4" />Back to auctions</button>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">{official ? 'Optracard Official Store' : 'Marketplace auction'}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{official ? 'Create official auction' : Number.isInteger(auctionId) ? 'Edit auction' : 'Create auction'}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">Create an auction listing independently from storefront inventory. Product information is saved with the auction and used only for this bidding lot.</p>
            {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <form onSubmit={submit} className="mt-8 space-y-8">
              <section aria-labelledby="auction-product-heading">
                <div className="flex items-start gap-3"><ImagePlus className="mt-0.5 h-5 w-5 text-orange-600" /><div><h2 id="auction-product-heading" className="font-bold text-slate-900">1. Product information</h2><p className="mt-1 text-sm text-slate-500">Enter the same core details as a new product listing. This auction item is not added to normal storefront stock.</p></div></div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold">Product name<input required value={form.title} onChange={(event) => update('title', event.target.value)} className={control} placeholder="e.g. Blue-Eyes White Dragon Ghost Rare" /></label>
                  <label className="text-sm font-semibold">Card game<select required value={form.gameId ?? ''} disabled={loadingGames} onChange={(event) => update('gameId', Number(event.target.value))} className={control}><option value="">{loadingGames ? 'Loading card games…' : 'Select a card game'}</option>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
                  <label className="text-sm font-semibold">Product type<input required value={form.type} onChange={(event) => update('type', event.target.value)} className={control} placeholder="Single, Booster Box, Accessories…" /></label>
                  <label className="text-sm font-semibold">Language<input value={form.language ?? ''} onChange={(event) => update('language', event.target.value)} className={control} placeholder="English, Japanese…" /></label>
                  <label className="text-sm font-semibold">Set / product code<input value={form.productSet ?? ''} onChange={(event) => update('productSet', event.target.value)} className={control} placeholder="Set name or code" /></label>
                </div>
                <label className="mt-5 block text-sm font-semibold">Product description<textarea required rows={5} value={form.description} onChange={(event) => update('description', event.target.value)} className={control} placeholder="Describe contents, rarity, visible defects, and other bidder-relevant details." /></label>
                <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-sm font-semibold">Product image</h3><p className="mt-1 text-xs font-normal text-slate-500">Upload an image or paste an image URL. It is stored with this auction only.</p></div>{form.imageUrl && <button type="button" onClick={() => update('imageUrl', '')} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600"><X className="h-3.5 w-3.5" />Remove image</button>}</div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]"><div className="flex h-36 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">{form.imageUrl ? <img src={form.imageUrl} alt="Product preview" className="h-full w-full object-contain" /> : <ImagePlus className="h-7 w-7 text-slate-300" />}</div><div className="space-y-3"><button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50"><ImagePlus className="h-4 w-4" />Choose image</button><input ref={fileRef} type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} className="hidden" /><label className="block text-sm font-semibold"><span className="flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5" />Image URL</span><input value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" className={control} /></label></div></div>
                </section>
              </section>
              <section aria-labelledby="auction-condition-heading" className="border-t border-slate-100 pt-7">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-orange-600" /><div><h2 id="auction-condition-heading" className="font-bold text-slate-900">2. Condition and evidence</h2><p className="mt-1 text-sm text-slate-500">Provide enough detail for buyers to bid confidently.</p></div></div>
                <div className="mt-5 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold">Card condition<input maxLength={80} value={form.cardCondition ?? ''} onChange={(event) => update('cardCondition', event.target.value)} className={control} placeholder="Near Mint, Lightly Played, Sealed…" /></label><label className="text-sm font-semibold">Grading and certificate<input maxLength={100} value={form.grading ?? ''} onChange={(event) => update('grading', event.target.value)} className={control} placeholder="PSA 9 · certificate number" /></label></div>
                <label htmlFor="auction-evidence-images" className="mt-5 block text-sm font-semibold"><span>Evidence image URLs</span><textarea id="auction-evidence-images" rows={4} value={form.evidenceImages?.join('\n') ?? ''} onChange={(event) => update('evidenceImages', event.target.value.split('\n'))} className={control} placeholder={'https://example.com/card-front.jpg\nhttps://example.com/card-back.jpg'} /><span className="mt-1 block text-xs font-normal text-slate-500">Optional: one HTTP(S) URL per line, maximum 8.</span></label>
              </section>
              <section aria-labelledby="auction-timing-heading" className="border-t border-slate-100 pt-7">
                <div className="flex items-start gap-3"><CalendarClock className="mt-0.5 h-5 w-5 text-orange-600" /><div><h2 id="auction-timing-heading" className="font-bold text-slate-900">3. Starting price and timing</h2><p className="mt-1 text-sm text-slate-500">Times are interpreted in Bangkok time.</p></div></div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-semibold">Starting price (฿)<input required min="0.01" step="0.01" type="number" value={form.startingPrice || ''} onChange={(event) => update('startingPrice', Number(event.target.value))} className={control} /></label><label className="text-sm font-semibold">Minimum bid increment (฿)<input aria-label="Minimum bid increment (฿)" required min="0.01" max="1000000" step="0.01" type="number" value={form.bidIncrement || ''} onChange={(event) => update('bidIncrement', Number(event.target.value))} className={control} /><span className="mt-1 block text-xs font-normal text-slate-500">Added to the current bid for each raise.</span></label><label className="text-sm font-semibold">Starts at<input required type="datetime-local" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} className={control} /></label><label className="text-sm font-semibold">Ends at<input required type="datetime-local" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} className={control} /></label></div>
              </section>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6"><button type="button" onClick={() => navigate(back)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold hover:bg-slate-50">Cancel</button><button disabled={saving || loadingGames} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{saving ? 'Saving…' : action}</button></div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
