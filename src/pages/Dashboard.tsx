import { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCcw,
  ShoppingBag,
  ArrowRight,
  Plus,
  AlertTriangle,
  Store,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { loadMyStore, loadSellerOrders, loadSellerProducts } from '../api/seller';
import type { SellerOrder, SellerProduct, SellerStoreInfo } from '../types/seller';
import { formatPrice } from '../context/formatters';

const statusBadge: Record<string, string> = {
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-amber-50 text-amber-700 border-amber-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Canceled: 'bg-red-50 text-red-700 border-red-200',
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<SellerStoreInfo | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedStore, loadedProducts, loadedOrders] = await Promise.all([
        loadMyStore().catch(() => null),
        loadSellerProducts(),
        loadSellerOrders().catch(() => []),
      ]);
      setStore(loadedStore);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const revenue = orders
    .filter((order) => order.status !== 'Canceled')
    .reduce((total, order) => total + Number(order.total ?? 0), 0);
  const liveCount = products.filter((p) => p.approvalStatus === 'APPROVED' && p.active).length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'PENDING').length;
  const lowStockProducts = products.filter((p) => p.active && p.stock <= 3);

  const storeName = store?.storeName || 'My Shop';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="dashboard" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Spacer for Fixed AdminHeader */}
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            {/* Header / Store Welcome Banner */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Seller Workspace</span>
                  {store && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        store.storeStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          store.storeStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {store.storeStatus}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Store className="h-7 w-7 text-blue-600" />
                  {storeName}
                </h1>
                <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                  {store?.storeDescription || 'A live summary of your shop statistics, stock, and orders pulled from the database.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/add-product')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
                {store?.storeId && (
                  <Link
                    to="/seller-profile/my"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                  >
                    View Storefront <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void load()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                  title="Refresh data"
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

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500">
                Loading shop dashboard data…
              </div>
            ) : (
              <>
                {/* 4 Stat KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">Total Products</p>
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Package className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{products.length}</p>
                    <Link
                      to="/seller"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Manage stock <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-emerald-800">Live Listings</p>
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-emerald-900">{liveCount}</p>
                    <p className="mt-3 text-xs text-emerald-700">Approved & active on marketplace</p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amber-800">Pending Review</p>
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                        <Clock3 className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-amber-900">{pendingCount}</p>
                    <p className="mt-3 text-xs text-amber-700">Awaiting admin catalog approval</p>
                  </div>

                  <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-violet-800">Total Order Revenue</p>
                      <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-extrabold text-violet-900">{formatPrice(revenue)}</p>
                    <Link
                      to="/orders-management"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
                    >
                      {orders.length} total orders <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Grid: Recent Orders & Stock Alerts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Orders */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <h2 className="font-bold text-slate-900">Recent Customer Orders</h2>
                        </div>
                        <Link
                          to="/orders-management"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {orders.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                          <p className="text-sm font-medium">No orders received yet.</p>
                          <p className="text-xs text-slate-400 mt-1">When buyers order your products, they will appear here.</p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {orders.slice(0, 5).map((order) => {
                            const badge = statusBadge[order.status] || 'bg-slate-100 text-slate-700 border-slate-200';
                            return (
                              <div
                                key={order.orderId}
                                onClick={() => navigate('/orders-management')}
                                className="flex items-center justify-between rounded-xl bg-slate-50/80 hover:bg-slate-100/70 p-4 border border-slate-100 transition cursor-pointer"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Buyer: {order.recipientName || `Buyer #${order.buyerId}`} • {order.items?.length ?? 0} item(s)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-blue-600 text-sm">{formatPrice(order.total)}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {orders.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link
                          to="/orders-management"
                          className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          Manage all {orders.length} orders <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </section>

                  {/* Stock Alerts */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <h2 className="font-bold text-slate-900">Low Stock Alerts</h2>
                        </div>
                        <Link
                          to="/seller"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View stock <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {lowStockProducts.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
                          <p className="text-sm font-medium text-slate-700">All products have healthy stock levels.</p>
                          <p className="text-xs text-slate-400 mt-1">No products currently with 3 or fewer items remaining.</p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {lowStockProducts.slice(0, 5).map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between rounded-xl bg-amber-50/50 hover:bg-amber-50/80 p-3.5 border border-amber-100 transition"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-9 rounded-md bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-xs">🃏</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 text-sm truncate">{product.name}</p>
                                  <p className="text-xs text-slate-500">{product.game} • {formatPrice(product.price)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-extrabold ${
                                    product.stock === 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/edit-product/${product.id}`)}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                >
                                  Restock
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {lowStockProducts.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <Link
                          to="/seller"
                          className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          Review all inventory <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
