import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Pencil, Plus, RefreshCcw, Search, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { deactivateSellerProduct, loadSellerProducts } from '../api/seller';
import type { SellerProduct } from '../types/seller';

const money = (value: number) => `฿${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const statusStyle: Record<SellerProduct['approvalStatus'], string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const Status = ({ status }: { status: SellerProduct['approvalStatus'] }) => {
  const Icon = status === 'APPROVED' ? CheckCircle2 : status === 'REJECTED' ? XCircle : Clock3;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[status]}`}><Icon className="h-3.5 w-3.5" />{status}</span>;
};

export const Seller = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | SellerProduct['approvalStatus']>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try { setProducts(await loadSellerProducts()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not load your products.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.game.toLowerCase().includes(query);
    return matchesSearch && (status === 'ALL' || product.approvalStatus === status);
  }), [products, search, status]);

  const deactivate = async (product: SellerProduct) => {
    if (!window.confirm(`Remove ${product.name} from your shop?`)) return;
    try { await deactivateSellerProduct(product.id); await load(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not remove the product.'); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="stocks" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />
        <main className="flex-1 overflow-y-auto p-8"><div className="mx-auto max-w-[1440px]">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">My Shop</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Stocks Management</h1><p className="mt-1 text-sm text-slate-500">New listings stay hidden from buyers until Admin approval.</p></div><button type="button" onClick={() => navigate('/add-product')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" />Add new product</button></div>
          <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total products</p><p className="mt-1 text-3xl font-bold">{products.length}</p></div><div className="rounded-xl border border-amber-100 bg-amber-50 p-5 shadow-sm"><p className="text-sm text-amber-700">Waiting for approval</p><p className="mt-1 text-3xl font-bold text-amber-800">{products.filter((product) => product.approvalStatus === 'PENDING').length}</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm"><p className="text-sm text-emerald-700">Live on Marketplace</p><p className="mt-1 text-3xl font-bold text-emerald-800">{products.filter((product) => product.approvalStatus === 'APPROVED' && product.active).length}</p></div></div>
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or card game" className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20" /></div><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm outline-none"><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select><button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"><RefreshCcw className="h-4 w-4" />Refresh</button></div>
          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Type / Game</th><th className="px-5 py-4 text-center">Stock</th><th className="px-5 py-4">Cost</th><th className="px-5 py-4">Selling price</th><th className="px-5 py-4">Approval</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Loading your products…</td></tr>}
            {!isLoading && filtered.map((product) => <tr key={product.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-12 w-10 overflow-hidden rounded bg-slate-100">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}</div><div><p className="font-bold text-slate-900">{product.name}</p><p className="text-xs text-slate-400">ID: {product.id}</p></div></div></td><td className="px-5 py-4"><p className="font-medium">{product.type}</p><p className="text-xs text-slate-500">{product.game}</p></td><td className="px-5 py-4 text-center font-bold">{product.stock}</td><td className="px-5 py-4">{money(product.cost)}</td><td className="px-5 py-4 font-bold text-blue-600">{money(product.price)}</td><td className="px-5 py-4"><Status status={product.approvalStatus} /></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => navigate(`/edit-product/${product.id}`)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:text-blue-600" aria-label="Edit product"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void deactivate(product)} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50" aria-label="Remove product"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">No products found in this filter.</td></tr>}
          </tbody></table></div>
        </div></main>
      </div>
    </div>
  );
};

export default Seller;
