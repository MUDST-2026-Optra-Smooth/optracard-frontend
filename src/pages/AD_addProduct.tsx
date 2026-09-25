import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminProduct } from '../api/admin';
import { AdminProductForm, emptyAdminProduct } from '../components/AdminProductForm';
import { AdminWorkspace } from '../components/AdminWorkspace';

export const ADaddProduct = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  return <AdminWorkspace currentTab="stocks"><div className="mb-6"><button type="button" onClick={() => navigate('/admin/stocks')} className="text-sm font-bold text-blue-600">← Back to stock management</button><h1 className="mt-3 text-3xl font-bold text-slate-900">Add Official Store product</h1><p className="mt-1 text-sm text-slate-500">The product ID is assigned by the database after it is saved.</p></div><AdminProductForm initialValue={emptyAdminProduct} submitLabel="Create product" isSubmitting={submitting} onCancel={() => navigate('/admin/stocks')} onSubmit={async (product) => { setSubmitting(true); try { const created = await createAdminProduct(product); navigate(`/admin/products/${created.id}`, { replace: true }); } finally { setSubmitting(false); } }} /></AdminWorkspace>;
};

export default ADaddProduct;
