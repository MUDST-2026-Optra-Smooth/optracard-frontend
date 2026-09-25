import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadSuperAdminStores } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { SuperAdminStore } from '../types/superadmin';

export function SPAD_Stores() {
  const [stores, setStores] = useState<SuperAdminStore[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try { setStores(await loadSuperAdminStores()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load stores.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visibleStores = useMemo(() => (stores ?? []).filter((store) => {
    const matchesQuery = `${store.storeName} ${store.ownerName} ${store.ownerEmail ?? ''} ${store.location ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (status === 'ALL' || store.storeStatus === status);
  }), [stores, query, status]);
  const approved = (stores ?? []).filter((store) => store.storeStatus === 'APPROVED').length;
  const pending = (stores ?? []).filter((store) => store.storeStatus === 'PENDING').length;

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading title="Stores" description="Verified marketplace stores and their real inventory and sales activity." action={stores ? <SPAD_ExportButton label="Export stores" fileName="optracard-stores.csv" rows={visibleStores.map((store) => ({ store: store.storeName, owner: store.ownerName, status: store.storeStatus, listings: store.productCount, orders: store.orderCount, gmv: store.gmv }))} /> : undefined} />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !stores ? <SPAD_Loading /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Total stores" value={String(stores.length)} /><SPAD_StatCard label="Approved stores" value={String(approved)} detail="Allowed to publish marketplace listings" tone="teal" /><SPAD_StatCard label="Pending verification" value={String(pending)} detail="Waiting for administrator review" tone="orange" /></div>
      <SPAD_FilterBar><SPAD_FilterField label="Search store"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Store, owner, email, or location" /></SPAD_FilterField><SPAD_FilterField label="Status"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All statuses</option><option value="APPROVED">Approved</option><option value="PENDING">Pending</option><option value="REJECTED">Rejected</option></select></SPAD_FilterField><div className="self-end text-[9px] text-[#8e99aa]">{visibleStores.length} matching stores</div></SPAD_FilterBar>
      <SPAD_Panel title={`Stores · ${visibleStores.length} results`} subtitle="Open a store to inspect the current listings and order totals."><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Store</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Location</th><th className="px-4 py-3 text-right">Listings / Stock</th><th className="px-4 py-3 text-right">Orders / GMV</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{visibleStores.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-[#8e99aa]">No stores match the selected filters.</td></tr> : visibleStores.map((store) => <tr key={store.storeId} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><p className="font-bold text-[#303844]">{store.storeName}</p><p className="mt-1 text-[8px] text-[#8e99aa]">Submitted {formatDate(store.submittedAt)}</p></td><td className="px-4 py-3"><p className="font-medium">{store.ownerName}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{store.ownerEmail ?? 'No email recorded'}</p></td><td className="px-4 py-3 text-[#687486]">{store.location ?? '—'}</td><td className="px-4 py-3 text-right"><p className="font-bold">{store.productCount}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{store.totalStock} units</p></td><td className="px-4 py-3 text-right"><p className="font-bold">{store.orderCount}</p><p className="mt-1 text-[8px] text-[#2f65ff]">{formatCurrency(store.gmv)}</p></td><td className="px-4 py-3"><SPAD_StatusBadge label={store.storeStatus} tone={statusTone(store.storeStatus)} /></td><td className="px-4 py-3 text-right"><Link className="font-bold text-[#2f65ff] hover:underline" to={`/superadmin/stores/${store.storeId}`}>View →</Link></td></tr>)}</tbody></table></div></SPAD_Panel>
    </>}
  </div></SPAD_Shell>;
}
