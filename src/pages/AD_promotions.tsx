import { useEffect, useState } from 'react';
import { Pencil, RotateCcw, TicketPercent, Trash2 } from 'lucide-react';
import {
  createAdminPromotion,
  deleteAdminPromotion,
  loadAdminPromotions,
  updateAdminPromotion,
} from '../api/admin';
import { AdminError, AdminLoading, AdminWorkspace, formatCurrency, formatDate, StatusBadge } from '../components/AdminWorkspace';
import type { AdminPromotion, AdminPromotionInput } from '../types/admin';

const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const newPromotion = (): AdminPromotionInput => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return {
    code: '', name: '', discountType: 'PERCENTAGE', discountValue: 10, minimumOrderAmount: 0,
    usageLimit: null, startsAt: localDateTime(now), endsAt: localDateTime(end), active: true,
  };
};

const inputFromPromotion = (promotion: AdminPromotion): AdminPromotionInput => ({
  code: promotion.code,
  name: promotion.name,
  discountType: promotion.discountType,
  discountValue: promotion.discountValue,
  minimumOrderAmount: promotion.minimumOrderAmount,
  usageLimit: promotion.usageLimit,
  startsAt: promotion.startsAt.slice(0, 16),
  endsAt: promotion.endsAt.slice(0, 16),
  active: promotion.active,
});

const promotionState = (promotion: AdminPromotion) => {
  if (!promotion.active) return 'INACTIVE';
  if (new Date(promotion.endsAt) < new Date()) return 'EXPIRED';
  if (new Date(promotion.startsAt) > new Date()) return 'SCHEDULED';
  if (promotion.usageLimit !== null && promotion.usageCount >= promotion.usageLimit) return 'LIMIT REACHED';
  return 'ACTIVE';
};

export const ADpromotions = () => {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [form, setForm] = useState<AdminPromotionInput>(newPromotion);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPromotions(await loadAdminPromotions());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load promotions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const update = <K extends keyof AdminPromotionInput>(key: K, value: AdminPromotionInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(newPromotion());
    setError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim() };
      const saved = editingId === null
        ? await createAdminPromotion(payload)
        : await updateAdminPromotion(editingId, payload);
      setPromotions((current) => editingId === null
        ? [saved, ...current]
        : current.map((promotion) => promotion.id === saved.id ? saved : promotion));
      setNotice(editingId === null ? 'Promotion created.' : 'Promotion updated.');
      resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save promotion.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (promotion: AdminPromotion) => {
    setEditingId(promotion.id);
    setForm(inputFromPromotion(promotion));
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (promotion: AdminPromotion) => {
    if (!window.confirm(`Delete promotion ${promotion.code}? Existing order snapshots will remain.`)) return;
    setError(null);
    setNotice(null);
    try {
      await deleteAdminPromotion(promotion.id);
      setPromotions((current) => current.filter((item) => item.id !== promotion.id));
      if (editingId === promotion.id) resetForm();
      setNotice('Promotion deleted.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete promotion.');
    }
  };

  return (
    <AdminWorkspace currentTab="promotions">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600"><TicketPercent className="h-6 w-6" /><span className="text-sm font-bold uppercase tracking-wide">Sales tools</span></div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">Create and control discount codes. Checkout verifies every rule on the server.</p>
        </div>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><h2 className="font-bold text-slate-900">{editingId === null ? 'Create promotion' : 'Edit promotion'}</h2><p className="mt-1 text-xs text-slate-500">Percent discounts are capped at 100%; fixed discounts never reduce an order below zero.</p></div>
          {editingId !== null && <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"><RotateCcw className="h-3.5 w-3.5" /> Cancel edit</button>}
        </div>
        {error && <div className="mb-4"><AdminError message={error} /></div>}
        {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-700">Code<input required value={form.code} onChange={(event) => update('code', event.target.value.toUpperCase())} maxLength={50} pattern="[A-Z0-9_-]{3,50}" placeholder="SAVE10" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="block text-sm font-semibold text-slate-700">Promotion name<input required value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={255} placeholder="Welcome discount" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-slate-700">Discount type<select value={form.discountType} onChange={(event) => update('discountType', event.target.value as AdminPromotionInput['discountType'])} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount</option></select></label><label className="block text-sm font-semibold text-slate-700">{form.discountType === 'PERCENTAGE' ? 'Percent' : 'Amount (฿)'}<input required type="number" min="0.01" max={form.discountType === 'PERCENTAGE' ? 100 : undefined} step="0.01" value={String(form.discountValue)} onFocus={(event) => { if (Number(event.currentTarget.value) === 0) event.currentTarget.select(); }} onChange={(event) => { const normalized = event.currentTarget.value.replace(/^0+(?=\d)/, ''); update('discountValue', normalized === '' ? 0 : Number(normalized)); }} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label></div>
          <label className="block text-sm font-semibold text-slate-700">Minimum order (฿)<input required type="number" min="0" step="0.01" value={String(form.minimumOrderAmount)} onFocus={(event) => { if (Number(event.currentTarget.value) === 0) event.currentTarget.select(); }} onChange={(event) => { const normalized = event.currentTarget.value.replace(/^0+(?=\d)/, ''); update('minimumOrderAmount', normalized === '' ? 0 : Number(normalized)); }} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
          <label className="block text-sm font-semibold text-slate-700">Usage limit <span className="font-normal text-slate-400">(blank = unlimited)</span><input type="number" min="1" value={form.usageLimit ?? ''} onChange={(event) => update('usageLimit', event.target.value === '' ? null : Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
          <label className="block text-sm font-semibold text-slate-700">Start date<input required type="datetime-local" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
          <label className="block text-sm font-semibold text-slate-700">End date<input required type="datetime-local" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
          <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> Promotion is active</label>
          <div className="flex items-end"><button type="submit" disabled={saving} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving…' : editingId === null ? 'Create promotion' : 'Save changes'}</button></div>
        </form>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">All promotions</h2><span className="text-sm text-slate-500">{promotions.length} total</span></div>
        {loading ? <AdminLoading label="Loading promotions…" /> : promotions.length === 0 ? <p className="px-5 py-12 text-center text-sm text-slate-500">No promotions yet. Create your first discount code above.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Discount</th><th className="px-5 py-3">Rules</th><th className="px-5 py-3">Schedule</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{promotions.map((promotion) => <tr key={promotion.id} className="border-t border-slate-100 align-top hover:bg-slate-50"><td className="px-5 py-4"><p className="font-mono font-bold text-blue-700">{promotion.code}</p><p className="mt-1 text-xs text-slate-500">{promotion.name}</p></td><td className="px-5 py-4 font-semibold text-slate-800">{promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}% off` : `${formatCurrency(promotion.discountValue)} off`}</td><td className="px-5 py-4 text-xs text-slate-600"><p>Minimum: {formatCurrency(promotion.minimumOrderAmount)}</p><p className="mt-1">Used: {promotion.usageCount}{promotion.usageLimit === null ? ' / unlimited' : ` / ${promotion.usageLimit}`}</p></td><td className="px-5 py-4 text-xs text-slate-600"><p>Start: {formatDate(promotion.startsAt)}</p><p className="mt-1">End: {formatDate(promotion.endsAt)}</p></td><td className="px-5 py-4"><StatusBadge status={promotionState(promotion)} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => edit(promotion)} className="rounded-md p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" title={`Edit ${promotion.code}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(promotion)} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" title={`Delete ${promotion.code}`}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
      </section>
    </AdminWorkspace>
  );
};

export default ADpromotions;
