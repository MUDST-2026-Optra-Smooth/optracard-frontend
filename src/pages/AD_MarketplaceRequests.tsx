import { useEffect, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  approveMarketplaceRequest,
  rejectMarketplaceRequest,
  loadAdminMarketplaceProduct,
} from '../api/admin';
import {
  AdminError,
  AdminLoading,
  AdminWorkspace,
  formatCurrency,
  StatusBadge,
} from '../components/AdminWorkspace';
import type { AdminProduct } from '../types/admin';

export const AD_MarketplaceRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setProduct(await loadAdminMarketplaceProduct(productId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load marketplace request.');
    }
  };

  useEffect(() => {
    if (Number.isInteger(productId) && productId > 0) {
      void load();
    } else {
      setError('Invalid product ID.');
    }
  }, [productId]);

  const review = async (action: 'approve' | 'reject') => {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      if (action === 'approve') {
        await approveMarketplaceRequest(product.id);
        setSuccessMessage('Listing approved successfully and published to the marketplace database.');
        setShowRejectInput(false);
      } else {
        await rejectMarketplaceRequest(product.id, rejectNote);
        setSuccessMessage('Listing rejected and deactivated in the marketplace database.');
        setShowRejectInput(false);
      }
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not review marketplace request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminWorkspace currentTab="marketplace-requests">
      <button
        type="button"
        onClick={() => navigate('/admin/marketplace/requests')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace Requests
      </button>

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

      {!error && !product && <AdminLoading label="Loading marketplace listing request from database…" />}

      {product && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Marketplace listing · ID {product.id}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted by{' '}
                  <button
                    type="button"
                    onClick={() =>
                      product.storeId && navigate(`/admin/marketplace/stores/${product.storeId}`)
                    }
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {product.storeName}
                  </button>
                </p>
              </div>
              <StatusBadge status={product.approvalStatus} />
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-[220px_1fr]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-80 w-full rounded-xl border bg-slate-50 object-contain ring-1 ring-slate-100"
                />
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                  No image
                </div>
              )}

              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase text-blue-700">Price</p>
                    <p className="mt-1 text-2xl font-bold text-blue-800">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase text-emerald-700">Stock</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{product.stock ?? 0}</p>
                  </div>
                </div>

                <dl className="mt-5 divide-y rounded-xl border border-slate-200">
                  <div className="flex justify-between gap-5 p-4">
                    <dt className="text-slate-500">Card game</dt>
                    <dd className="font-bold text-right">{product.game}</dd>
                  </div>
                  <div className="flex justify-between gap-5 p-4">
                    <dt className="text-slate-500">Product type</dt>
                    <dd className="font-bold text-right">{product.type}</dd>
                  </div>
                  <div className="flex justify-between gap-5 p-4">
                    <dt className="text-slate-500">Set</dt>
                    <dd className="font-bold text-right">{product.productSet ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-5 p-4">
                    <dt className="text-slate-500">Language</dt>
                    <dd className="font-bold text-right">{product.language ?? '—'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <h2 className="font-bold text-slate-900">Seller description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {product.description ?? 'No description provided.'}
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Review decision</h2>
            <p className="mt-1 text-sm text-slate-500">
              Approval immediately publishes this listing to the marketplace in the database.
            </p>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current status</p>
              <div className="mt-1">
                <StatusBadge status={product.approvalStatus} />
              </div>
            </div>

            {showRejectInput ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Rejection note (optional)
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={3}
                    placeholder="Provide feedback for the seller..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-red-400"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 rounded-lg border border-slate-300 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void review('reject')}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {product.approvalStatus === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      disabled={saving}
                      type="button"
                      onClick={() => setShowRejectInput(true)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      disabled={saving}
                      type="button"
                      onClick={() => void review('approve')}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                )}
                {product.approvalStatus === 'REJECTED' && (
                  <button
                    disabled={saving}
                    type="button"
                    onClick={() => void review('approve')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Approve & Reinstate Listing
                  </button>
                )}
                {product.approvalStatus === 'APPROVED' && (
                  <button
                    disabled={saving}
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Reject / Revoke Approval
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default AD_MarketplaceRequestDetail;
