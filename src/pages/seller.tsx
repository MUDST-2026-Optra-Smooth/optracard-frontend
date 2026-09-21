import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  XCircle,
  Package,
  AlertTriangle,
  Store,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { deactivateSellerProduct, loadMyStore, loadSellerProducts } from '../api/seller';
import type { SellerProduct, SellerStoreInfo } from '../types/seller';
import { formatPrice } from '../context/formatters';

const statusStyle: Record<SellerProduct['approvalStatus'], string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const StatusBadge = ({ status }: { status: SellerProduct['approvalStatus'] }) => {
  const Icon = status === 'APPROVED' ? CheckCircle2 : status === 'REJECTED' ? XCircle : Clock3;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[status]}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
};

export const Seller = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<SellerStoreInfo | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | SellerProduct['approvalStatus']>('ALL');
  const [gameFilter, setGameFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedStore, loadedProducts] = await Promise.all([
        loadMyStore().catch(() => null),
        loadSellerProducts(),
      ]);
      setStore(loadedStore);
      setProducts(loadedProducts);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const uniqueGames = useMemo(() => {
    const games = new Set<string>();
    products.forEach((p) => {
      if (p.game) games.add(p.game);
    });
    return Array.from(games);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.game.toLowerCase().includes(query) ||
        String(product.id).includes(query);
      const matchesStatus = status === 'ALL' || product.approvalStatus === status;
      const matchesGame = gameFilter === 'ALL' || product.game === gameFilter;
      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [products, search, status, gameFilter]);

  const deactivate = async (product: SellerProduct) => {
    if (!window.confirm(`Are you sure you want to remove "${product.name}" from your shop stock?`)) return;
    setDeletingId(product.id);
    try {
      await deactivateSellerProduct(product.id);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not remove the product.');
    } finally {
      setDeletingId(null);
    }
  };

  const storeName = store?.storeName || 'My Shop';
  const approvedCount = products.filter((p) => p.approvalStatus === 'APPROVED' && p.active).length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'PENDING').length;
  const lowStockCount = products.filter((p) => p.active && p.stock <= 3).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="stocks" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Spacer for Fixed AdminHeader */}
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">My Shop</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{storeName}</span>
                </div>
                <h1 className="mt-1 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-7 w-7 text-blue-600" />
                  Stocks Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your inventory, pricing, and view review statuses for {storeName}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/add-product')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add New Product
              </button>
            </div>

            {/* Inventory KPI Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Listings</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-xs">
                <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Live on Marketplace</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{approvedCount}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 shadow-xs">
                <p className="text-xs font-medium text-amber-800 uppercase tracking-wider">Waiting for Approval</p>
                <p className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 shadow-xs">
                <p className="text-xs font-medium text-rose-800 uppercase tracking-wider">Low / Out of Stock</p>
                <p className="mt-2 text-2xl font-bold text-rose-900">{lowStockCount}</p>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product name, card game, or ID…"
                  className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Approval Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                {uniqueGames.length > 0 && (
                  <select
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                    className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Card Games</option>
                    {uniqueGames.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => void load()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  title="Reload inventory"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product Details</th>
                    <th className="px-5 py-4">Game / Category</th>
                    <th className="px-5 py-4 text-center">Stock</th>
                    <th className="px-5 py-4">Cost Price</th>
                    <th className="px-5 py-4">Selling Price</th>
                    <th className="px-5 py-4">Profit Est.</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                        Loading your shop products from database…
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    filtered.map((product) => {
                      const profit = Number(product.price ?? 0) - Number(product.cost ?? 0);
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition">
                          {/* Product Details */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-10 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-sm">🃏</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate max-w-xs">{product.name}</p>
                                <p className="text-xs text-slate-400">ID: #{product.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Game / Category */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">{product.game || 'Card Game'}</p>
                            <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {product.type}
                            </span>
                          </td>

                          {/* Stock */}
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                product.stock === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : product.stock <= 3
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {product.stock} left
                            </span>
                          </td>

                          {/* Cost */}
                          <td className="px-5 py-4 text-slate-600 font-medium">
                            {formatPrice(product.cost)}
                          </td>

                          {/* Selling Price */}
                          <td className="px-5 py-4 font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </td>

                          {/* Profit */}
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {profit >= 0 ? `+${formatPrice(profit)}` : formatPrice(profit)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge status={product.approvalStatus} />
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/edit-product/${product.id}`)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                                aria-label={`Edit ${product.name}`}
                                title="Edit product"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === product.id}
                                onClick={() => void deactivate(product)}
                                className="rounded-lg border border-rose-200 p-2 text-rose-500 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                                aria-label={`Delete ${product.name}`}
                                title="Remove product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {!isLoading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                        <Package className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700">No products found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your search or filters, or add a new listing.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/add-product')}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add First Product
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Seller;
