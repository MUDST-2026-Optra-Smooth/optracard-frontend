import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Filter, RefreshCcw, WalletCards } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { loadSellerSettlements } from '../api/settlements';
import type { SettlementEntryType, SettlementReport } from '../types/settlements';

const currency = (value: number | null | undefined) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 2,
}).format(value ?? 0);

const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));

const badgeClass = (status: string) => status === 'REVERSED'
  ? 'border-red-200 bg-red-50 text-red-700'
  : 'border-emerald-200 bg-emerald-50 text-emerald-700';

export const SellerSettlements = () => {
  const [report, setReport] = useState<SettlementReport | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState<SettlementEntryType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReport(await loadSellerSettlements({ from: from || undefined, to: to || undefined, type }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load settlement earnings.');
    } finally {
      setLoading(false);
    }
  }, [from, to, type]);

  useEffect(() => { void load(); }, []); // Initial report deliberately has no date filter.

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="settlements" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Seller Workspace</p>
                <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl"><WalletCards className="h-7 w-7 text-blue-600" /> Earnings & Settlements</h1>
                <p className="mt-1 text-sm text-slate-500">Marketplace earnings after platform fees. Shipping is excluded from these totals.</p>
              </div>
              <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Metric label="Gross sales after discounts" value={currency(report?.summary.grossAmount)} tone="blue" />
              <Metric label="Marketplace fees" value={currency(report?.summary.feeAmount)} tone="amber" />
              <Metric label="Your net earnings" value={currency(report?.summary.netAmount)} tone="emerald" />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="grid gap-3 md:grid-cols-4 md:items-end">
                <FilterField label="From"><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" /></FilterField>
                <FilterField label="To"><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" /></FilterField>
                <FilterField label="Entry type"><select value={type} onChange={(event) => setType(event.target.value as SettlementEntryType | 'ALL')} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"><option value="ALL">All entries</option><option value="ORDER_CHARGE">Order charge</option><option value="AUCTION_CHARGE">Auction charge</option><option value="REVERSAL">Reversal</option></select></FilterField>
                <button type="button" onClick={() => void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"><Filter className="h-4 w-4" /> Apply filters</button>
              </div>
            </section>

            {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
            {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500">Loading settlements…</div> : (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-slate-900">Settlement ledger</h2><p className="mt-1 text-xs text-slate-500">Charges and reversals are retained for your financial history.</p></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Date / Reference</th><th className="px-5 py-4">Type</th><th className="px-5 py-4 text-right">Gross</th><th className="px-5 py-4 text-right">Fee rate</th><th className="px-5 py-4 text-right">Fee</th><th className="px-5 py-4 text-right">Net</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
                  {(report?.entries ?? []).map((entry) => <tr key={entry.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-slate-900">{entry.referenceNumber}</p><p className="mt-1 text-xs text-slate-500">{formatDate(entry.createdAt)}</p></td><td className="px-5 py-4"><p className="font-semibold text-slate-800">{entry.type.replace('_', ' ')}</p><p className="mt-1 text-xs text-slate-500">{entry.storeName}</p></td><td className="px-5 py-4 text-right font-semibold">{currency(entry.grossAmount)}</td><td className="px-5 py-4 text-right">{entry.feeRate.toFixed(2)}%</td><td className="px-5 py-4 text-right text-amber-700">{currency(entry.feeAmount)}</td><td className="px-5 py-4 text-right font-bold text-emerald-700">{currency(entry.netAmount)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${badgeClass(entry.status)}`}>{entry.status}</span></td></tr>)}
                  {(report?.entries.length ?? 0) === 0 ? <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-500">No settlement entries match these filters.</td></tr> : null}
                </tbody></table></div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'emerald' }) => {
  const styles = { blue: 'border-blue-100 bg-blue-50/60 text-blue-900', amber: 'border-amber-100 bg-amber-50/60 text-amber-900', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-900' };
  return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-sm font-medium opacity-70">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p></div>;
};

const FilterField = ({ label, children }: { label: string; children: ReactNode }) => <label className="block text-sm font-semibold text-slate-700"><span className="mb-1.5 block">{label}</span>{children}</label>;
