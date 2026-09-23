import { useEffect, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Store, X } from 'lucide-react';
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

export const AD_MarketplaceProductDetail = () => {
  const navigate = useNavigate();
  const { productId: rawProductId } = useParams<{ productId: string }>();
  const productId = Number(rawProductId);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setProduct(await loadAdminMarketplaceProduct(productId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load marketplace product.');
    }
  };

  useEffect(() => {
    if (Number.isInteger(productId) && productId > 0) {
      void load();
    } else {
      setError('Invalid product ID.');
    }
  }, [productId]);

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      if (action === 'approve') {
        await approveMarketplaceRequest(product.id);
        setSuccessMessage(`Listing “${product.name}” has been approved and published to the marketplace.`);
      } else {
        await rejectMarketplaceRequest(product.id);
        setSuccessMessage(`Listing “${product.name}” has been removed / deactivated from the marketplace.`);
      }
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to update product status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminWorkspace currentTab="marketplace-products">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {error && <AdminError message={error} onRetry={() => void load()} />}

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

      {!error && !product && <AdminLoading label="Loading marketplace product from database…" />}

      {product && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Marketplace listing · ID {product.id}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>Sold by</span>
                {product.storeId ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/marketplace/stores/${product.storeId}`)}
                    className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Store className="h-3.5 w-3.5" />
                    {product.storeName}
                  </button>
                ) : (
                  <strong className="text-slate-700">{product.storeName}</strong>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={product.approvalStatus} />

              {product.approvalStatus === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleReview('reject')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleReview('approve')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                </div>
              )}

              {product.approvalStatus === 'APPROVED' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleReview('reject')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Take Down Listing
                </button>
              )}

              {product.approvalStatus === 'REJECTED' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleReview('approve')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  Approve / Reinstate
                </button>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[280px_1fr]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[430px] w-full rounded-xl border border-slate-200 bg-slate-50 object-contain ring-1 ring-slate-100"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                No image
              </div>
            )}

            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-700">Listing price</p>
                  <p className="mt-1 text-2xl font-bold text-blue-800">{formatCurrency(product.price)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-700">Available stock</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">{product.stock ?? 0}</p>
                </div>
              </div>

              <dl className="divide-y rounded-xl border border-slate-200">
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
                <div className="p-4">
                  <dt className="mb-2 text-slate-500">Seller description</dt>
                  <dd className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {product.description ?? 'No description provided.'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default AD_MarketplaceProductDetail;
