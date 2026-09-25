import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Eye, RefreshCcw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  approveMarketplaceRequest,
  rejectMarketplaceRequest,
  loadAdminMarketplaceProducts,
} from '../api/admin';
import {
  AdminError,
  AdminLoading,
  AdminWorkspace,
  formatCurrency,
  StatusBadge,
} from '../components/AdminWorkspace';
import type { AdminProduct } from '../types/admin';

export const AD_MarketplaceRequestsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [status, setStatus] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await loadAdminMarketplaceProducts());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load marketplace requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (status === 'ALL' || product.approvalStatus === status) &&
        (!value ||
          `${product.name} ${product.storeName} ${product.game} ${product.id}`
            .toLowerCase()
            .includes(value)),
    );
  }, [products, status, query]);

  const review = async (product: AdminProduct, action: 'approve' | 'reject') => {
    setError(null);
    setReviewingId(product.id);
    try {
      if (action === 'approve') {
        await approveMarketplaceRequest(product.id);
        setSuccessMessage(`Product listing “${product.name}” has been approved and published to the marketplace.`);
      } else {
        await rejectMarketplaceRequest(product.id);
        setSuccessMessage(`Product listing “${product.name}” has been rejected.`);
      }
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not review marketplace request.');
    } finally {
      setReviewingId(null);
    }
  };

  const pending = products.filter((product) => product.approvalStatus === 'PENDING').length;
  const approved = products.filter((product) => product.approvalStatus === 'APPROVED').length;
  const rejected = products.filter((product) => product.approvalStatus === 'REJECTED').length;

  return (
    <AdminWorkspace currentTab="marketplace-requests">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Seller listing review</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Marketplace Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, approve, or reject seller product listings before they appear to buyers in the marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 cursor-pointer"
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

      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">All listings</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-700">Pending review</p>
          <p className="mt-1 text-3xl font-bold text-amber-800">{pending}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-sm text-emerald-700">Approved</p>
          <p className="mt-1 text-3xl font-bold text-emerald-800">{approved}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-red-700">Rejected</p>
          <p className="mt-1 text-3xl font-bold text-red-800">{rejected}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, card game, or seller store"
            className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 md:w-52"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending only</option>
          <option value="APPROVED">Approved only</option>
          <option value="REJECTED">Rejected only</option>
        </select>
      </div>

      {loading ? (
        <AdminLoading label="Loading marketplace requests from database…" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Seller store</th>
                <th className="px-5 py-4 text-right">Price / Stock</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-14 w-11 rounded bg-slate-100 object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="h-14 w-11 rounded bg-slate-100 ring-1 ring-slate-200" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {product.game} · {product.type} · ID {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{product.storeName}</td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-slate-500">{product.stock ?? 0} in stock</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.approvalStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/marketplace/requests/${product.id}`)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-100 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {product.approvalStatus === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            disabled={reviewingId === product.id}
                            onClick={() => void review(product, 'reject')}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === product.id}
                            onClick={() => void review(product, 'approve')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        </>
                      )}
                      {product.approvalStatus === 'REJECTED' && (
                        <button
                          type="button"
                          disabled={reviewingId === product.id}
                          onClick={() => void review(product, 'approve')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                      {product.approvalStatus === 'APPROVED' && (
                        <button
                          type="button"
                          disabled={reviewingId === product.id}
                          onClick={() => void review(product, 'reject')}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No marketplace listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default AD_MarketplaceRequestsList;
