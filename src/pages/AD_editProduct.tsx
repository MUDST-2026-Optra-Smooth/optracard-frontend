import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdminProduct, updateAdminProduct } from '../api/admin';
import { AdminProductForm, emptyAdminProduct } from '../components/AdminProductForm';
import { AdminError, AdminLoading, AdminWorkspace } from '../components/AdminWorkspace';
import type { AdminProductInput } from '../types/admin';

export const ADeditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [initialValue, setInitialValue] = useState<AdminProductInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <AdminWorkspace currentTab="stocks">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/stocks')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to stock management
        </button>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Edit Official Store Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Modifying product ID #{productId}. Changes are saved directly to the database.
        </p>
      </div>

      {error && <AdminError message={error} onRetry={() => void load()} />}
      {!error && !initialValue && <AdminLoading label="Loading product details from database…" />}

      {initialValue && (
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
      )}
    </AdminWorkspace>
  );
};

export default ADeditProduct;
