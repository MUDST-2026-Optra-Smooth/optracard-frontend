import { useEffect, useState } from 'react';
import { Banknote, Boxes, ClipboardCheck, Eye, PackageCheck, RefreshCcw, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadAdminDashboard } from '../api/admin';
import { AdminError, AdminLoading, AdminWorkspace, formatCurrency, formatDate, StatusBadge } from '../components/AdminWorkspace';
import type { AdminDashboard } from '../types/admin';

const Stat = ({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Banknote;
  tone: string;
}) => (
  <div className={`rounded-2xl p-5 text-white shadow-sm ${tone}`}>
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-white/85">{label}</p>
    <p className="mt-1 text-3xl font-extrabold">{value}</p>
    <p className="mt-2 text-xs text-white/80">{detail}</p>
  </div>
);

export const ADdashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await loadAdminDashboard());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminWorkspace currentTab="dashboard">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live database summary of Optracard revenue, stock, orders, and marketplace reviews.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5">
          <AdminError message={error} onRetry={() => void load()} />
        </div>
      )}

      {loading && <AdminLoading label="Loading live dashboard from database…" />}

      {!loading && dashboard && (
        <div className="space-y-6">
          {/* Top 3 High-level KPIs */}
          <div className="grid gap-4 md:grid-cols-3">
            <Stat
              label="Total revenue"
              value={formatCurrency(dashboard.totalRevenue)}
              detail="All customer orders recorded in database"
              icon={Banknote}
              tone="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <Stat
              label="Total expenses"
              value={formatCurrency(dashboard.totalExpenses)}
              detail="Cost price × ordered quantity recorded"
              icon={ShoppingBag}
              tone="bg-gradient-to-r from-orange-600 to-red-500"
            />
            <Stat
              label="Estimated profit"
              value={formatCurrency(dashboard.totalProfit)}
              detail="Revenue minus recorded product costs"
              icon={PackageCheck}
              tone="bg-gradient-to-r from-indigo-500 to-violet-600"
            />
          </div>

          {/* 4 Secondary KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Orders</p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.totalOrders}</p>
              <p className="mt-1 text-xs text-slate-500">{dashboard.totalItems} item(s) sold</p>
            </button>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average order</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(dashboard.averageOrderValue)}</p>
              <p className="mt-1 text-xs text-slate-500">Calculated from all orders</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/stocks')}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Official inventory</p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.activeOfficialProducts}</p>
              <p className="mt-1 text-xs text-slate-500">{dashboard.lowStockProducts} low-stock listing(s)</p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/marketplace/products')}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Marketplace listings</p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.activeMarketplaceProducts}</p>
              <p className="mt-1 text-xs text-slate-500">Active approved listings</p>
            </button>
          </div>

          {/* Monthly Breakdown & Action Items */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="font-bold text-slate-900">Revenue & expenses by month</h2>
                  <p className="text-xs text-slate-500">Derived from recorded customer orders and product costs.</p>
                </div>
              </div>
              {dashboard.monthlyMetrics.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No order history available in the database yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="pb-3">Month</th>
                        <th className="pb-3 text-right">Revenue</th>
                        <th className="pb-3 text-right">Expenses</th>
                        <th className="pb-3 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.monthlyMetrics.map((metric) => (
                        <tr key={metric.month} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 font-semibold">{metric.month}</td>
                          <td className="py-3 text-right text-emerald-700">{formatCurrency(metric.revenue)}</td>
                          <td className="py-3 text-right text-orange-700">{formatCurrency(metric.expenses)}</td>
                          <td className="py-3 text-right font-bold text-blue-700">
                            {formatCurrency(metric.revenue - metric.expenses)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-slate-900">Awaiting action</h2>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/store-requests')}
                  className="w-full rounded-lg bg-amber-50 p-4 text-left transition hover:bg-amber-100 cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-amber-900">Store Verification</p>
                    <ArrowRight className="h-4 w-4 text-amber-700" />
                  </div>
                  <p className="mt-1 text-3xl font-bold text-amber-700">{dashboard.pendingStoreVerifications}</p>
                  <p className="text-xs text-amber-700">seller store application(s) pending review</p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/marketplace/requests')}
                  className="w-full rounded-lg bg-blue-50 p-4 text-left transition hover:bg-blue-100 cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-blue-900">Marketplace Requests</p>
                    <ArrowRight className="h-4 w-4 text-blue-700" />
                  </div>
                  <p className="mt-1 text-3xl font-bold text-blue-700">{dashboard.pendingMarketplaceRequests}</p>
                  <p className="text-xs text-blue-700">product listing(s) awaiting approval</p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/stocks')}
                  className="w-full rounded-lg bg-slate-50 p-4 text-left transition hover:bg-slate-100 cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Stock attention</p>
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                  </div>
                  <p className="mt-1 text-3xl font-bold text-slate-800">{dashboard.lowStockProducts}</p>
                  <p className="text-xs text-slate-500">official listing(s) with 5 or fewer left</p>
                </button>
              </div>
            </section>
          </div>

          {/* Recent Orders Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="font-bold text-slate-900">Recent orders</h2>
              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View all orders →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Buyer</th>
                    <th className="px-5 py-3">Store</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-blue-600">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="hover:underline cursor-pointer"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="px-5 py-4">{order.buyerName}</td>
                      <td className="px-5 py-4 text-slate-600">{order.storeName ?? 'Optracard Official Store'}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4 text-right font-bold">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dashboard.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default ADdashboard;
