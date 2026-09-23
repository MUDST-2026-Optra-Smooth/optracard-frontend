import { useEffect, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdminStore, reviewAdminStore } from '../api/admin';
import {
  AdminError,
  AdminLoading,
  AdminWorkspace,
  formatDate,
  StatusBadge,
} from '../components/AdminWorkspace';
import type { AdminStore } from '../types/admin';

export const ADstoreRequestdetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);

  const [store, setStore] = useState<AdminStore | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const response = await loadAdminStore(storeId);
      setStore(response);
      setNote(response.reviewNote ?? '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load store application.');
    }
  };

  useEffect(() => {
    if (Number.isInteger(storeId) && storeId > 0) {
      void load();
    } else {
      setError('Invalid store ID.');
    }
  }, [storeId]);

  const review = async (status: 'APPROVED' | 'REJECTED') => {
    if (!store) return;
    setSaving(true);
    setError(null);
    try {
      await reviewAdminStore(store.storeId, status, note);
      setSuccessMessage(
        status === 'APPROVED'
          ? `Store “${store.storeName}” application has been APPROVED in database. The user now has the SELLER role.`
          : `Store “${store.storeName}” application has been REJECTED in database.`,
      );
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not review store application.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminWorkspace currentTab="manage-requests">
      <button
        type="button"
        onClick={() => navigate('/admin/store-requests')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Store Verification
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

      {!error && !store && <AdminLoading label="Loading store application from database…" />}

      {store && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Store application · ID {store.storeId}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{store.storeName}</h1>
              <p className="mt-1 text-sm text-slate-500">Submitted {formatDate(store.submittedAt)}</p>
            </div>
            <StatusBadge status={store.storeStatus} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Store profile</h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-[120px_1fr]">
                  {store.storeProfileImage ? (
                    <img
                      src={store.storeProfileImage}
                      alt=""
                      className="h-28 w-28 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {store.storeDescription ?? 'No store description.'}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-slate-400">Store type</span>
                        <br />
                        <strong>{store.physicalStore ? 'Physical store' : 'Online store'}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Current listings</span>
                        <br />
                        <strong>{store.productCount}</strong>
                      </p>
                      <p className="sm:col-span-2">
                        <span className="text-slate-400">Location</span>
                        <br />
                        <strong>
                          {[
                            store.storeAddress,
                            store.subdistrict,
                            store.district,
                            store.province,
                            store.postalCode,
                          ]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-slate-900">Owner information</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-400">Name</dt>
                      <dd className="font-semibold text-slate-900">{store.ownerName || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Email</dt>
                      <dd className="font-semibold text-slate-900">{store.ownerEmail ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Phone</dt>
                      <dd className="font-semibold text-slate-900">{store.ownerPhone ?? '—'}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-slate-900">Payout details</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-400">Bank</dt>
                      <dd className="font-semibold text-slate-900">
                        {store.bankName ?? '—'} {store.bankBranch ? `· ${store.bankBranch}` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Account name</dt>
                      <dd className="font-semibold text-slate-900">{store.bankAccountName ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Account number</dt>
                      <dd className="font-semibold text-slate-900">{store.bankAccountNumber ?? '—'}</dd>
                    </div>
                  </dl>
                  {store.bankPassbookImage && (
                    <img
                      src={store.bankPassbookImage}
                      alt="Bank passbook"
                      className="mt-4 max-h-48 rounded-lg border object-contain"
                    />
                  )}
                </section>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">Verification decision</h2>
              <p className="mt-1 text-sm text-slate-500">
                Approving grants this user the SELLER role and activates their store profile in the database.
              </p>

              <label className="mt-5 block text-sm font-semibold text-slate-700">
                Review note (optional)
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-blue-500"
                  placeholder="Optional review message for the seller..."
                />
              </label>

              <div className="mt-5 space-y-2">
                {store.storeStatus === 'PENDING' ? (
                  <div className="flex gap-3">
                    <button
                      disabled={saving}
                      type="button"
                      onClick={() => void review('REJECTED')}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      disabled={saving}
                      type="button"
                      onClick={() => void review('APPROVED')}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      {store.storeStatus === 'APPROVED' ? (
                        <button
                          disabled={saving}
                          type="button"
                          onClick={() => void review('REJECTED')}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Revoke Approval
                        </button>
                      ) : (
                        <button
                          disabled={saving}
                          type="button"
                          onClick={() => void review('APPROVED')}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Re-approve Application
                        </button>
                      )}
                    </div>
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      Reviewed on {formatDate(store.reviewedAt)}.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default ADstoreRequestdetail;
