import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, Pencil, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deactivateAdminProduct, loadAdminProducts } from '../api/admin';
import { AdminError, AdminLoading, AdminWorkspace, formatCurrency, StatusBadge } from '../components/AdminWorkspace';
import type { AdminProduct } from '../types/admin';

export const ADstocks = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await loadAdminProducts());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load official stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const productTypes = useMemo(
    () =>
      [...new Set(products.map((product) => product.type).filter(Boolean))].sort((first, second) =>
        first.localeCompare(second),
      ),
    [products],
  );

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesType = typeFilter === 'ALL' || product.type === typeFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? product.active : !product.active);
      const matchesQuery =
        !value ||
        `${product.id} ${product.name} ${product.game} ${product.type}`
          .toLowerCase()
          .includes(value);

      return matchesType && matchesStatus && matchesQuery;
    });
  }, [products, query, typeFilter, statusFilter]);

  const deactivate = async (product: AdminProduct) => {
    if (
      !window.confirm(
        `Are you sure you want to delete / deactivate “${product.name}”?\n\nThis will remove it from the active official store catalog in the database.`,
      )
    ) {
      return;
    }

    try {
      await deactivateAdminProduct(product.id);
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, active: false } : item)),
      );
      setSuccessMessage(`Product “${product.name}” (ID: ${product.id}) has been deactivated in the database.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not deactivate product.');
    }
  };

  return (
    <AdminWorkspace currentTab="stocks">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stocks Management</h1>
          <p className="mt-1 text-sm text-slate-500">Official Store inventory, selling prices, and availability.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
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

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product ID, name, card game, or type"
              className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 md:w-52"
          >
            <option value="ALL">Type: All</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>
                Type: {type}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 md:w-44"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Active only</option>
            <option value="INACTIVE">Inactive only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Loading official products from database…" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Card game / Type</th>
                <th className="px-5 py-4 text-right">Stock</th>
                <th className="px-5 py-4 text-right">Cost</th>
                <th className="px-5 py-4 text-right">Sell price</th>
                <th className="px-5 py-4 text-right">Margin</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-12 w-10 rounded bg-slate-100 object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="h-12 w-10 rounded bg-slate-100 ring-1 ring-slate-200" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{product.game}</p>
                    <p className="text-xs text-slate-500">{product.type}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-bold">{product.stock ?? 0}</td>
                  <td className="px-5 py-4 text-right text-orange-700">{formatCurrency(product.cost)}</td>
                  <td className="px-5 py-4 text-right text-blue-700">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-700">
                    {formatCurrency((product.price ?? 0) - (product.cost ?? 0))}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.active ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                        title="View details"
                        className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        title="Edit product"
                        className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {product.active && (
                        <button
                          type="button"
                          onClick={() => void deactivate(product)}
                          title="Delete / deactivate product from database"
                          className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No official products found.
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

export default ADstocks;
