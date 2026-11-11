import { useCallback, useEffect, useState } from 'react';
import { loadMarketplaceFeeConfig, loadMarketplaceFeeHistory, loadSuperAdminSettlements, updateMarketplaceFeeConfig } from '../api/settlements';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { MarketplaceFeeConfig, SettlementEntryType, SettlementReport } from '../types/settlements';

export function SPAD_MarketplaceFee() {
  const [configuration, setConfiguration] = useState<MarketplaceFeeConfig | null>(null);
  const [history, setHistory] = useState<MarketplaceFeeConfig[]>([]);
  const [report, setReport] = useState<SettlementReport | null>(null);
  const [feeRate, setFeeRate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState<SettlementEntryType | 'ALL'>('ALL');
  const [sellerUserId, setSellerUserId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [current, allHistory, ledger] = await Promise.all([
        loadMarketplaceFeeConfig(), loadMarketplaceFeeHistory(), loadSuperAdminSettlements({
          from: from || undefined, to: to || undefined, type,
          sellerUserId: sellerUserId ? Number(sellerUserId) : undefined,
          storeId: storeId ? Number(storeId) : undefined,
        }),
      ]);
      setConfiguration(current); setHistory(allHistory); setReport(ledger); setFeeRate(String(current.feeRate));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load marketplace fee data.'); }
    finally { setLoading(false); }
  }, [from, to, type, sellerUserId, storeId]);

  useEffect(() => { void load(); }, []); // The first load is unfiltered.

  const saveFee = async () => {
    const nextRate = Number(feeRate);
    if (!Number.isFinite(nextRate) || nextRate < 0 || nextRate > 100) { setError('Enter a fee rate from 0 to 100.'); return; }
    setSaving(true); setError(''); setMessage('');
    try { await updateMarketplaceFeeConfig(nextRate); setMessage('Marketplace fee rate updated. Historical charges retain their original rate.'); await load(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update fee rate.'); }
    finally { setSaving(false); }
  };

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading eyebrow="Marketplace finance" title="Marketplace Fee & Settlement" description="Manage the current platform fee and audit immutable seller settlement entries." />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : null}
    {message ? <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
    {loading ? <SPAD_Loading label="Loading marketplace fee data…" /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Current marketplace fee" value={`${configuration?.feeRate?.toFixed(2) ?? '0.00'}%`} tone="purple" variant="gradient" /><SPAD_StatCard label="Gross after discounts" value={formatCurrency(report?.summary.grossAmount)} tone="teal" variant="gradient" /><SPAD_StatCard label="Seller net earnings" value={formatCurrency(report?.summary.netAmount)} tone="blue" variant="gradient" /></div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <SPAD_Panel title="Current fee rate" subtitle="A change creates a new version; historical ledger entries never change."><div className="space-y-4 p-4"><label className="block"><span className="mb-1 block text-[9px] font-bold text-[#687486]">Fee rate (%)</span><SPAD_Input type="number" min="0" max="100" step="0.01" value={feeRate} onChange={(event) => setFeeRate(event.target.value)} /></label><button type="button" disabled={saving} onClick={() => void saveFee()} className="rounded bg-[#2f65ff] px-3 py-2 text-[9px] font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Update fee rate'}</button><p className="text-[9px] text-[#8e99aa]">Effective since {formatDate(configuration?.effectiveFrom)}</p></div></SPAD_Panel>
        <SPAD_Panel title="Fee-rate history" subtitle="The actor and start time are captured for audit."><div className="max-h-48 overflow-auto"><table className="w-full text-left text-[10px]"><thead className="sticky top-0 bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Effective</th><th className="px-4 py-3">Changed by</th></tr></thead><tbody className="divide-y divide-[#edf0f4]">{history.map((item) => <tr key={item.id}><td className="px-4 py-3 font-bold text-[#2f65ff]">{item.feeRate.toFixed(2)}%</td><td className="px-4 py-3 text-[#687486]">{formatDate(item.effectiveFrom)}</td><td className="px-4 py-3 text-[#303844]">{item.changedBy}</td></tr>)}{history.length === 0 ? <tr><td colSpan={3} className="px-4 py-8 text-center text-[#8e99aa]">No fee-rate history found.</td></tr> : null}</tbody></table></div></SPAD_Panel>
      </div>
      <SPAD_FilterBar><SPAD_FilterField label="From"><SPAD_Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></SPAD_FilterField><SPAD_FilterField label="To"><SPAD_Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></SPAD_FilterField><SPAD_FilterField label="Entry type"><select value={type} onChange={(event) => setType(event.target.value as SettlementEntryType | 'ALL')} className="h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All entries</option><option value="ORDER_CHARGE">Order charge</option><option value="AUCTION_CHARGE">Auction charge</option><option value="REVERSAL">Reversal</option></select></SPAD_FilterField><button type="button" onClick={() => void load()} className="self-end rounded border border-[#2f65ff] bg-[#2f65ff] px-3 py-2 text-[9px] font-bold text-white">Apply filters</button></SPAD_FilterBar>
      <div className="grid gap-3 md:grid-cols-2"><label className="text-[9px] font-bold text-[#687486]">Seller user ID<SPAD_Input type="number" min="1" value={sellerUserId} onChange={(event) => setSellerUserId(event.target.value)} placeholder="Optional" /></label><label className="text-[9px] font-bold text-[#687486]">Store ID<SPAD_Input type="number" min="1" value={storeId} onChange={(event) => setStoreId(event.target.value)} placeholder="Optional" /></label></div>
      <SPAD_Panel title="Settlement ledger" subtitle="Totals include negative reversals so gross, fee, and net represent the current financial position."><div className="overflow-x-auto"><table className="w-full min-w-[1060px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Fee</th><th className="px-4 py-3 text-right">Net</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{(report?.entries ?? []).map((entry) => <tr key={entry.id} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><p className="font-bold text-[#303844]">{entry.referenceNumber}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{formatDate(entry.createdAt)}</p></td><td className="px-4 py-3"><p className="font-medium text-[#303844]">{entry.storeName}</p><p className="mt-1 text-[8px] text-[#8e99aa]">Seller #{entry.sellerUserId} · Store #{entry.storeId}</p></td><td className="px-4 py-3 text-[#687486]">{entry.type.replace('_', ' ')}</td><td className="px-4 py-3 text-right font-bold">{formatCurrency(entry.grossAmount)}</td><td className="px-4 py-3 text-right">{entry.feeRate.toFixed(2)}%</td><td className="px-4 py-3 text-right text-[#c27b1b]">{formatCurrency(entry.feeAmount)}</td><td className="px-4 py-3 text-right font-bold text-[#159568]">{formatCurrency(entry.netAmount)}</td><td className="px-4 py-3"><SPAD_StatusBadge label={entry.status} tone={statusTone(entry.status)} /></td></tr>)}{(report?.entries.length ?? 0) === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#8e99aa]">No settlement records match the selected filters.</td></tr> : null}</tbody></table></div></SPAD_Panel>
    </>}
  </div></SPAD_Shell>;
}
