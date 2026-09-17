import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { loadAdminCardGames } from '../api/admin';
import type { AdminCardGame, AdminProductInput } from '../types/admin';
import { AdminError } from './AdminWorkspace';

export const emptyAdminProduct: AdminProductInput = {
  name: '', game: '', type: 'Single Card', cost: 0, price: 0, stock: 0,
  imageUrl: null, productSet: null, language: null, description: null,
};

interface AdminProductFormProps {
  initialValue: AdminProductInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (value: AdminProductInput) => Promise<void>;
}

export const AdminProductForm = ({ initialValue, submitLabel, isSubmitting = false, onCancel, onSubmit }: AdminProductFormProps) => {
  const [value, setValue] = useState<AdminProductInput>(initialValue);
  const [games, setGames] = useState<AdminCardGame[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setValue(initialValue); }, [initialValue]);
  useEffect(() => {
    void loadAdminCardGames().then(setGames).catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : 'Could not load card games.');
    });
  }, []);

  const update = <K extends keyof AdminProductInput>(key: K, nextValue: AdminProductInput[K]) => {
    setValue((current) => ({ ...current, [key]: nextValue }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try { await onSubmit(value); } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save product.');
    }
  };

  return <form onSubmit={(event) => void submit(event)} className="space-y-6">
    {error && <AdminError message={error} />}
    <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">Product name<input required value={value.name} onChange={(event) => update('name', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Card game<select required value={value.game} onChange={(event) => update('game', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"><option value="">Select a card game</option>{games.map((game) => <option key={game.id} value={game.name}>{game.name}</option>)}</select></label>
      <label className="text-sm font-semibold text-slate-700">Product type<input required value={value.type} onChange={(event) => update('type', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Image URL<input value={value.imageUrl ?? ''} onChange={(event) => update('imageUrl', event.target.value || null)} placeholder="https://…" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Set<input value={value.productSet ?? ''} onChange={(event) => update('productSet', event.target.value || null)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Language<input value={value.language ?? ''} onChange={(event) => update('language', event.target.value || null)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Cost price<input required min="0" type="number" step="0.01" value={value.cost} onChange={(event) => update('cost', Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 font-normal outline-none focus:border-orange-500" /></label>
      <label className="text-sm font-semibold text-slate-700">Selling price<input required min="0" type="number" step="0.01" value={value.price} onChange={(event) => update('price', Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
      <label className="text-sm font-semibold text-slate-700 md:col-span-2">Available stock<input required min="0" type="number" step="1" value={value.stock} onChange={(event) => update('stock', Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="text-sm font-semibold text-slate-700 md:col-span-2">Description<textarea value={value.description ?? ''} onChange={(event) => update('description', event.target.value || null)} rows={6} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
    </div>
    <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button><button disabled={isSubmitting} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitLabel}</button></div>
  </form>;
};
