import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadSuperAdminTransactions } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { SuperAdminTransaction } from '../types/superadmin';

export function SPAD_Transactions() {
  const [transactions, setTransactions] = useState<SuperAdminTransaction[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try { setTransactions(await loadSuperAdminTransactions()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load transactions.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => (transactions ?? []).filter((transaction) => {
    const text = `${transaction.orderNumber} ${transaction.buyerName} ${transaction.storeName ?? ''} ${transaction.source}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === 'ALL' || transaction.status.toUpperCase() === status);
  }), [transactions, query, status]);
  const total = (transactions ?? []).reduce((sum, transaction) => sum + (transaction.total ?? 0), 0);
  const delivered = (transactions ?? []).filter((transaction) => transaction.status === 'Delivered').length;
  const processing = (transactions ?? []).filter((transaction) => transaction.status === 'Processing' || transaction.status === 'Shipped').length;

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading title="Sales & Transactions" description="Orders recorded in the platform database, grouped by their stored seller and fulfillment status." action={transactions ? <SPAD_ExportButton label="Export transactions" fileName="optracard-transactions.csv" rows={visible.map((transaction) => ({ order: transaction.orderNumber, created_at: transaction.createdAt ?? '', buyer: transaction.buyerName, store: transaction.storeName ?? 'Optracard Official Store', source: transaction.source, total: transaction.total ?? 0, status: transaction.status, payment_status: transaction.paymentStatus ?? '' }))} /> : undefined} />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !transactions ? <SPAD_Loading /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Recorded orders" value={String(transactions.length)} /><SPAD_StatCard label="Recorded GMV" value={formatCurrency(total)} tone="teal" /><SPAD_StatCard label="Fulfillment" value={`${delivered} delivered`} detail={`${processing} processing or shipped`} tone="purple" /></div>
      <SPAD_FilterBar><SPAD_FilterField label="Search order"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order number, buyer, store, or source" /></SPAD_FilterField><SPAD_FilterField label="Fulfillment status"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All statuses</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELED">Canceled</option></select></SPAD_FilterField><div className="self-end text-[9px] text-[#8e99aa]">{visible.length} matching orders</div></SPAD_FilterBar>
      <SPAD_Panel title={`Transactions · ${visible.length} results`} subtitle="No transaction data is created in the interface; each row is an order from the database."><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Source</th><th className="px-4 py-3 text-right">Items</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{visible.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-[#8e99aa]">No transactions match the selected filters.</td></tr> : visible.map((transaction) => <tr key={transaction.id} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><p className="font-bold text-[#303844]">{transaction.orderNumber}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{formatDate(transaction.createdAt)}</p></td><td className="px-4 py-3 font-medium text-[#303844]">{transaction.buyerName}</td><td className="px-4 py-3"><p className="font-medium text-[#303844]">{transaction.storeName ?? 'Optracard Official Store'}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{transaction.shippingMethod ?? 'Shipping method not set'}</p></td><td className="px-4 py-3 text-[#687486]">{transaction.source}</td><td className="px-4 py-3 text-right font-bold">{transaction.itemCount}</td><td className="px-4 py-3 text-right font-bold text-[#2f65ff]">{formatCurrency(transaction.total)}</td><td className="px-4 py-3"><SPAD_StatusBadge label={transaction.paymentStatus ?? 'Not recorded'} tone={statusTone(transaction.paymentStatus)} /></td><td className="px-4 py-3"><SPAD_StatusBadge label={transaction.status} tone={statusTone(transaction.status)} /></td></tr>)}</tbody></table></div></SPAD_Panel>
    </>}
  </div></SPAD_Shell>;
}
