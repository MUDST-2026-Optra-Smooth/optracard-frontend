import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Power, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdminProduct, updateAdminProduct, updateAdminProductActive } from '../api/admin';
import { AdminProductForm, emptyAdminProduct } from '../components/AdminProductForm';
import { AdminError, AdminLoading, AdminWorkspace } from '../components/AdminWorkspace';
import type { AdminProductInput } from '../types/admin';

export const ADeditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [initialValue, setInitialValue] = useState<AdminProductInput | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const product = await loadAdminProduct(productId);
      setInitialValue({
        name: product.name,
        game: product.game,
        type: product.type,
        cost: product.cost ?? 0,
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        imageUrl: product.imageUrl,
        productSet: product.productSet,
        language: product.language,
        description: product.description,
      });
      setActive(product.active);
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

  const updateVisibility = async (nextActive: boolean) => {
    setUpdatingVisibility(true);
    setError(null);
    try {
      const updated = await updateAdminProductActive(productId, nextActive);
      setActive(updated.active);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update product visibility.');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  return (
    <AdminWorkspace currentTab="stocks">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate('/admin/stocks')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stocks
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Official Store Product</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Edit product</h1>
          <p className="mt-2 text-sm text-slate-500">
            Modifying product ID #{productId}. Changes are saved directly to the database.
          </p>

          {error && <div className="mt-5"><AdminError message={error} onRetry={() => void load()} /></div>}
          {!error && !initialValue && <div className="mt-6"><AdminLoading label="Loading product details from database…" /></div>}

          {initialValue && (
            <>
              <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900">Storefront visibility</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Active products are visible in the Optracard Official Store.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold ${
                      active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={active === true || updatingVisibility}
                    onClick={() => void updateVisibility(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Power className="h-4 w-4" />
                    Set active
                  </button>
                  <button
                    type="button"
                    disabled={active === false || updatingVisibility}
                    onClick={() => void updateVisibility(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3.5 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Power className="h-4 w-4" />
                    Set inactive
                  </button>
                </div>
              </section>

              <div className="mt-8">
                <AdminProductForm
                  initialValue={initialValue ?? emptyAdminProduct}
                  submitLabel="Save changes to database"
                  isSubmitting={submitting}
                  onCancel={() => navigate(`/admin/products/${productId}`)}
                  onSubmit={async (product) => {
                    setSubmitting(true);
                    try {
                      await updateAdminProduct(productId, product);
                      navigate(`/admin/products/${productId}`, { replace: true });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AdminWorkspace>
  );
};

export default ADeditProduct;
