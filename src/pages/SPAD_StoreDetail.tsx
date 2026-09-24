import { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { loadSuperAdminStore } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { SuperAdminStore } from '../types/superadmin';

export function SPAD_StoreDetail() {
  const { storeId } = useParams();
  const [store, setStore] = useState<SuperAdminStore | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!storeId || Number.isNaN(Number(storeId))) { setError('This store ID is invalid.'); return; }
    setError('');
    try { setStore(await loadSuperAdminStore(Number(storeId))); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load the store.'); }
  }, [storeId]);
  useEffect(() => { void load(); }, [load]);

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading
      title={store?.storeName ?? 'Store details'}
      description={store ? `Owner: ${store.ownerName} · ${store.location ?? 'Location not recorded'}` : 'Loading the selected marketplace store.'}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#485363] hover:bg-[#f4f7fb]"
            title="Refresh store details from live database"
          >
            <RefreshCcw className="h-3 w-3 text-[#2f65ff]" />
            Refresh
          </button>
          <Link to="/superadmin/stores" className="cursor-pointer rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#687486] hover:bg-[#f4f7fb]">
            ← Back to stores
          </Link>
        </div>
      }
    />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !store ? <SPAD_Loading /> : <>
      <div className="flex flex-wrap items-center gap-2"><SPAD_StatusBadge label={store.storeStatus} tone={statusTone(store.storeStatus)} /><span className="text-[10px] text-[#8e99aa]">Submitted {formatDate(store.submittedAt)} · Reviewed {formatDate(store.reviewedAt)}</span></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SPAD_StatCard label="Listings" value={String(store.productCount)} /><SPAD_StatCard label="Active listings" value={String(store.activeProductCount)} tone="teal" /><SPAD_StatCard label="Total stock" value={String(store.totalStock)} tone="blue" /><SPAD_StatCard label="Recorded GMV" value={formatCurrency(store.gmv)} detail={`${store.orderCount} recorded orders`} tone="purple" /></div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]"><SPAD_Panel title="Marketplace inventory" subtitle="Products currently associated with this store in the database." action={<SPAD_ExportButton label="Export inventory" fileName={`${store.storeSlug}-inventory.csv`} rows={store.products.map((product) => ({ id: product.id, product: product.name, game: product.game, type: product.type, price: product.price ?? 0, stock: product.stock ?? 0, approval: product.approvalStatus, active: product.active ? 'Active' : 'Inactive' }))} />}><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Game / type</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3">State</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{store.products.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[#8e99aa]">This store has no marketplace listings.</td></tr> : store.products.map((product) => <tr key={product.id}><td className="px-4 py-3"><p className="font-bold text-[#303844]">{product.name}</p><p className="mt-1 text-[8px] text-[#8e99aa]">ID: {product.id}</p></td><td className="px-4 py-3"><p>{product.game}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{product.type}</p></td><td className="px-4 py-3 text-right font-bold text-[#2f65ff]">{formatCurrency(product.price)}</td><td className="px-4 py-3 text-right font-bold">{product.stock ?? 0}</td><td className="px-4 py-3"><div className="flex gap-1"><SPAD_StatusBadge label={product.active ? 'Active' : 'Inactive'} tone={product.active ? 'green' : 'red'} /><SPAD_StatusBadge label={product.approvalStatus} tone={statusTone(product.approvalStatus)} /></div></td></tr>)}</tbody></table></div></SPAD_Panel><SPAD_Panel title="Store contact" subtitle="Submitted seller details."><div className="space-y-3 px-4 py-4 text-[10px]"><p><span className="block text-[#8e99aa]">Owner</span><strong>{store.ownerName}</strong></p><p><span className="block text-[#8e99aa]">Email</span><strong>{store.ownerEmail ?? '—'}</strong></p><p><span className="block text-[#8e99aa]">Phone</span><strong>{store.ownerPhone ?? '—'}</strong></p><p><span className="block text-[#8e99aa]">Description</span><span>{store.description ?? 'No description provided.'}</span></p></div></SPAD_Panel></div>
    </>}
  </div></SPAD_Shell>;
}
