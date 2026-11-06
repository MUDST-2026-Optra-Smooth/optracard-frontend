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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { deleteSellerProduct, loadMyStore, loadSellerProducts } from '../api/seller';
import { loadStockAlertSettings, loadStockAlerts, type StockAlert, updateStockAlertSettings } from '../api/stockAlerts';
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

const ActiveBadge = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
      active
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-red-200 bg-red-50 text-red-700'
    }`}
  >
    {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {active ? 'ACTIVE' : 'INACTIVE'}
  </span>
);

export const Seller = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<SellerStoreInfo | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | SellerProduct['approvalStatus']>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [gameFilter, setGameFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [thresholdInput, setThresholdInput] = useState('5');
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedStore, loadedProducts, loadedAlerts, settings] = await Promise.all([
        loadMyStore().catch(() => null),
        loadSellerProducts(),
        loadStockAlerts().catch(() => []),
        loadStockAlertSettings().catch(() => ({ defaultThreshold: 5 })),
      ]);
      setStore(loadedStore);
      setProducts(loadedProducts);
      setStockAlerts(loadedAlerts);
      setStockThreshold(settings.defaultThreshold);
      setThresholdInput(String(settings.defaultThreshold));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveThreshold = async () => {
    const value = Number(thresholdInput);
    if (!Number.isInteger(value) || value < 1 || value > 100000) {
      setError('Stock alert threshold must be a whole number between 1 and 100,000.');
      return;
    }
    setSavingThreshold(true);
    setError(null);
    setThresholdMessage(null);
    try {
      const settings = await updateStockAlertSettings(value);
      setStockThreshold(settings.defaultThreshold);
      setThresholdInput(String(settings.defaultThreshold));
      setThresholdMessage(`This store now uses ${settings.defaultThreshold} as its stock alert threshold.`);
      await loadStockAlerts().then(setStockAlerts).catch(() => undefined);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update the store stock alert threshold.');
    } finally {
      setSavingThreshold(false);
    }
  };

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
      const matchesActive = activeFilter === 'ALL'
        || (activeFilter === 'ACTIVE' ? product.active : !product.active);
      const matchesGame = gameFilter === 'ALL' || product.game === gameFilter;
      return matchesSearch && matchesStatus && matchesActive && matchesGame;
    });
  }, [products, search, status, activeFilter, gameFilter]);

  const deleteProduct = async (product: SellerProduct) => {
    if (!window.confirm(`Permanently delete "${product.name}" from your shop?\n\nThis removes the product from the database and cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await deleteSellerProduct(product.id);
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
  const lowStockCount = stockAlerts.length;
  const outOfStockCount = stockAlerts.filter((alert) => alert.alertType === 'OUT_OF_STOCK').length;

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

            <section className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between">
              <div className="self-start">
                <h2 className="text-sm font-bold text-blue-950">Store stock alert threshold</h2>
                <p className="mt-1 max-w-2xl text-xs text-blue-800">
                  Only this store&apos;s products use this threshold. Stock at 0 always triggers Out of Stock.
                </p>
                {thresholdMessage && <p className="mt-2 text-xs font-semibold text-emerald-700">{thresholdMessage}</p>}
              </div>
              <div className="flex items-end gap-2">
                <label className="text-xs font-bold text-blue-900">
                  Store threshold
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    value={thresholdInput}
                    onChange={(event) => setThresholdInput(event.target.value)}
                    className="mt-1 block w-32 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void saveThreshold()}
                  disabled={savingThreshold || Number(thresholdInput) === stockThreshold}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {savingThreshold ? 'Saving…' : 'Save threshold'}
                </button>
              </div>
            </section>

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
                <p className="mt-1 text-[10px] text-rose-800">{outOfStockCount} out of stock · live alert data</p>
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

                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
                  className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Visibility States</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product Details</th>
                    <th className="px-5 py-4">Game / Category</th>
                    <th className="px-5 py-4 text-center">Stock</th>
                    <th className="px-5 py-4">Cost Price</th>
                    <th className="px-5 py-4">Selling Price</th>
                    <th className="px-5 py-4">Profit Est.</th>
                    <th className="px-5 py-4">Status / Visibility</th>
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
                                  : product.stock <= stockThreshold
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
                            <div className="flex flex-wrap gap-1.5">
                              <StatusBadge status={product.approvalStatus} />
                              <ActiveBadge active={product.active} />
                            </div>
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
                                onClick={() => void deleteProduct(product)}
                                className="rounded-lg border border-rose-200 p-2 text-rose-500 hover:bg-rose-50 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Delete ${product.name} permanently`}
                                title="Delete product permanently"
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
