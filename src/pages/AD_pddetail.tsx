import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { deactivateAdminProduct, loadAdminProduct } from '../api/admin';
import { AdminError, AdminLoading, AdminWorkspace, formatCurrency, StatusBadge } from '../components/AdminWorkspace';
import type { AdminProduct } from '../types/admin';

export const ADpddetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setProduct(await loadAdminProduct(productId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load product.');
    }
  };

  useEffect(() => {
    if (Number.isInteger(productId) && productId > 0) {
      void load();
    } else {
      setError('Invalid product ID.');
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;
    if (
      !window.confirm(
        `Are you sure you want to delete / deactivate “${product.name}”?\n\nThis will remove it from the active official store catalog in the database.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await deactivateAdminProduct(product.id);
      navigate('/admin/stocks', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete product.');
      setDeleting(false);
    }
  };

  return (
    <AdminWorkspace currentTab="stocks">
      <button
        type="button"
        onClick={() => navigate('/admin/stocks')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to stock management
      </button>

      {error && <AdminError message={error} onRetry={() => void load()} />}
      {!error && !product && <AdminLoading label="Loading product details from database…" />}

      {product && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Store · Product ID {product.id}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {product.game} · {product.type}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={product.active ? 'Active' : 'Inactive'} />
              <button
                type="button"
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Edit product
              </button>
              {product.active && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete / Deactivate
                </button>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[260px_1fr]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[380px] w-full rounded-xl border border-slate-200 bg-slate-50 object-contain ring-1 ring-slate-100"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                No image
              </div>
            )}

            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase text-orange-700">Cost Price</p>
                  <p className="mt-1 text-xl font-bold text-orange-800">{formatCurrency(product.cost)}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-700">Selling price</p>
                  <p className="mt-1 text-xl font-bold text-blue-800">{formatCurrency(product.price)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-700">Available stock</p>
                  <p className="mt-1 text-xl font-bold text-emerald-800">{product.stock ?? 0}</p>
                </div>
              </div>

              <dl className="divide-y rounded-xl border border-slate-200">
                <div className="flex justify-between gap-5 p-4">
                  <dt className="text-slate-500">Set</dt>
                  <dd className="font-bold text-right">{product.productSet ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-5 p-4">
                  <dt className="text-slate-500">Language</dt>
                  <dd className="font-bold text-right">{product.language ?? '—'}</dd>
                </div>
                <div className="p-4">
                  <dt className="mb-2 text-slate-500">Description</dt>
                  <dd className="whitespace-pre-wrap text-sm leading-relaxed">
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

export default ADpddetail;
