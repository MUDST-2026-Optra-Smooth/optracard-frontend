import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadSuperAdminCatalog } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatCurrency, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { SuperAdminCatalogProduct } from '../types/superadmin';

export function SPAD_Catalog() {
  const [products, setProducts] = useState<SuperAdminCatalogProduct[] | null>(null);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('ALL');
  const [state, setState] = useState('ALL');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try { setProducts(await loadSuperAdminCatalog()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load the catalog.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => (products ?? []).filter((product) => {
    const text = `${product.name} ${product.game} ${product.type} ${product.storeName}`.toLowerCase();
    const productState = !product.active ? 'INACTIVE' : product.approvalStatus;
    return text.includes(query.trim().toLowerCase()) && (source === 'ALL' || product.listingSource === source) && (state === 'ALL' || productState === state);
  }), [products, query, source, state]);
  const marketplace = (products ?? []).filter((product) => product.listingSource === 'MARKETPLACE').length;
  const active = (products ?? []).filter((product) => product.active && (product.listingSource !== 'MARKETPLACE' || product.approvalStatus === 'APPROVED')).length;
  const pending = (products ?? []).filter((product) => product.approvalStatus === 'PENDING').length;

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading
      title="Catalog"
      description="All official and marketplace products stored in the platform database."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#dfe4eb] bg-white px-3 py-1.5 text-[9px] font-semibold text-[#485363] hover:bg-[#f4f7fb]"
            title="Refresh catalog from live database"
          >
            <RefreshCcw className="h-3 w-3 text-[#2f65ff]" />
            Refresh
          </button>
          {products && <SPAD_ExportButton label="Export catalog" fileName="optracard-catalog.csv" rows={filtered.map((product) => ({ id: product.id, product: product.name, game: product.game, type: product.type, source: product.listingSource, store: product.storeName, price: product.price ?? 0, stock: product.stock ?? 0, approval: product.approvalStatus, active: product.active ? 'Active' : 'Inactive' }))} />}
        </div>
      }
    />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !products ? <SPAD_Loading /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="All products" value={String(products.length)} /><SPAD_StatCard label="Marketplace listings" value={String(marketplace)} tone="teal" /><SPAD_StatCard label="Pending approval" value={String(pending)} detail={`${active} listings currently visible`} tone="orange" /></div>
      <SPAD_FilterBar><SPAD_FilterField label="Search catalog"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product, game, type, or store" /></SPAD_FilterField><SPAD_FilterField label="Source"><select value={source} onChange={(event) => setSource(event.target.value)} className="h-8 w-full cursor-pointer rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All sources</option><option value="OFFICIAL">Official Store</option><option value="MARKETPLACE">Marketplace</option></select></SPAD_FilterField><SPAD_FilterField label="Listing state"><select value={state} onChange={(event) => setState(event.target.value)} className="h-8 w-full cursor-pointer rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All states</option><option value="APPROVED">Approved</option><option value="PENDING">Pending</option><option value="REJECTED">Rejected</option><option value="INACTIVE">Inactive</option></select></SPAD_FilterField><div className="self-end text-[9px] text-[#8e99aa]">{filtered.length} matching products</div></SPAD_FilterBar>
      <SPAD_Panel title={`Catalog · ${filtered.length} results`} subtitle="Public product pages are available only for active, approved listings."><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Game / Type</th><th className="px-4 py-3">Source / Store</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3">State</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-[#8e99aa]">No products match the selected filters.</td></tr> : filtered.map((product) => <tr key={product.id} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><div className="flex items-center gap-2.5">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-9 w-9 rounded border border-[#e1e6ee] object-cover" /> : <span className="h-9 w-9 rounded border border-[#e1e6ee] bg-[#f4f7fb]" />}<div><Link to={`/product/${product.id}`} className="cursor-pointer max-w-64 truncate font-bold text-[#303844] hover:text-[#2f65ff] hover:underline block">{product.name}</Link><p className="mt-1 text-[8px] text-[#8e99aa]">ID: {product.id}</p></div></div></td><td className="px-4 py-3"><p className="font-medium text-[#303844]">{product.game}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{product.type}</p></td><td className="px-4 py-3"><p className="font-medium text-[#303844]">{product.storeName}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{product.listingSource}</p></td><td className="px-4 py-3 text-right font-bold text-[#2f65ff]">{formatCurrency(product.price)}</td><td className="px-4 py-3 text-right font-bold">{product.stock ?? 0}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1"><SPAD_StatusBadge label={product.active ? 'Active' : 'Inactive'} tone={product.active ? 'green' : 'red'} />{product.listingSource === 'MARKETPLACE' && <SPAD_StatusBadge label={product.approvalStatus} tone={statusTone(product.approvalStatus)} />}</div></td><td className="px-4 py-3 text-right"><Link to={`/product/${product.id}`} className="cursor-pointer font-bold text-[#2f65ff] hover:underline">Open →</Link></td></tr>)}</tbody></table></div></SPAD_Panel>
    </>}
  </div></SPAD_Shell>;
}
