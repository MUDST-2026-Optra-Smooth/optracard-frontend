import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadSuperAdminOverview } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatCurrency, statusTone } from '../components/SPAD_DataState';
import { SPAD_Shell } from '../components/SPAD_Shell';
import {
  SPAD_ExportButton,
  SPAD_Panel,
  SPAD_SectionHeading,
  SPAD_StatCard,
  SPAD_StatusBadge,
} from '../components/SPAD_Widgets';
import type { SuperAdminOverview } from '../types/superadmin';

export function SPAD_Overview() {
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setRefreshing(true);
    try {
      setOverview(await loadSuperAdminOverview());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the platform overview.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxRevenue = useMemo(
    () => Math.max(...(overview?.monthlyMetrics.map((metric) => metric.revenue) ?? [0]), 1),
    [overview],
  );

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading
          title="Platform Overview"
          description="Live marketplace activity, stores, catalogue availability, and recent sales connected from backend database."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void load()}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#687486] shadow-sm hover:border-[#2f65ff] hover:text-[#2f65ff] disabled:opacity-50 cursor-pointer"
                title="Refresh platform overview data"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {overview ? (
                <SPAD_ExportButton
                  label="Export report"
                  fileName="optracard-platform-overview.csv"
                  rows={[
                    { metric: 'Stores', value: overview.totalStores },
                    { metric: 'Approved stores', value: overview.approvedStores },
                    { metric: 'Products listed', value: overview.listedProducts },
                    { metric: 'GMV (30 days)', value: overview.gmvLast30Days },
                    { metric: 'Orders (30 days)', value: overview.ordersLast30Days },
                  ]}
                />
              ) : undefined}
            </div>
          }
        />

        {error ? (
          <SPAD_Error message={error} onRetry={() => void load()} />
        ) : !overview ? (
          <SPAD_Loading label="Loading platform overview from database…" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SPAD_StatCard
                label="Total stores"
                value={String(overview.totalStores)}
                detail={`${overview.approvedStores} approved · ${overview.pendingStores} pending`}
                tone="blue"
                variant="gradient"
              />
              <SPAD_StatCard
                label="Products listed"
                value={String(overview.listedProducts)}
                detail={`${overview.activeListings} currently active`}
                tone="teal"
                variant="gradient"
              />
              <SPAD_StatCard
                label="Platform GMV · 30 days"
                value={formatCurrency(overview.gmvLast30Days)}
                detail="Completed and in-progress orders in the last 30 days"
                tone="orange"
                variant="gradient"
              />
              <SPAD_StatCard
                label="Orders · 30 days"
                value={String(overview.ordersLast30Days)}
                detail={`Average order ${formatCurrency(overview.averageOrderValueLast30Days)}`}
                tone="purple"
                variant="gradient"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(310px,1fr)]">
              <SPAD_Panel
                title="Marketplace performance"
                subtitle="Actual GMV and order count across the last 12 months from recorded orders."
              >
                <div className="space-y-3 px-4 py-4">
                  {overview.monthlyMetrics.map((metric) => (
                    <div
                      key={metric.month}
                      className="grid grid-cols-[48px_minmax(0,1fr)_78px] items-center gap-3 text-[10px]"
                    >
                      <span className="text-[#687486]">{metric.month}</span>
                      <div className="h-3 overflow-hidden rounded-full bg-[#eef2f7]">
                        <div
                          className="h-full rounded-full bg-[#2f65ff]"
                          style={{ width: `${(metric.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-right font-semibold text-[#303844]">
                        {formatCurrency(metric.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </SPAD_Panel>

              <SPAD_Panel
                title="Top stores by GMV"
                subtitle="Based on recorded marketplace orders in the database."
              >
                <div className="divide-y divide-[#edf0f4]">
                  {overview.topStores.length === 0 ? (
                    <p className="px-4 py-6 text-[10px] text-[#8e99aa]">There are no marketplace stores yet.</p>
                  ) : (
                    overview.topStores.map((store) => (
                      <Link
                        key={store.storeId}
                        to={`/superadmin/stores/${store.storeId}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-[10px] transition hover:bg-[#f8faff] cursor-pointer block"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#303844] hover:text-[#2f65ff]">
                            {store.storeName}
                          </p>
                          <p className="mt-0.5 text-[#8e99aa]">
                            {store.ownerName} · {store.productCount} listings
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-[#303844]">{formatCurrency(store.gmv)}</p>
                          <SPAD_StatusBadge label={store.status} tone={statusTone(store.status)} />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </SPAD_Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SPAD_Panel title="Catalog health" subtitle="Availability across approved active listings.">
                <div className="space-y-3 px-4 py-4 text-[10px]">
                  <div className="flex h-3 overflow-hidden rounded-full bg-[#edf0f4]">
                    <span className="bg-[#39b98c]" style={{ flex: overview.inStockListings }} />
                    <span className="bg-[#f0a01e]" style={{ flex: overview.lowStockListings }} />
                    <span className="bg-[#e66a6a]" style={{ flex: overview.outOfStockListings }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <p>
                      <span className="block text-[#8e99aa]">In stock</span>
                      <strong>{overview.inStockListings}</strong>
                    </p>
                    <p>
                      <span className="block text-[#8e99aa]">Low stock</span>
                      <strong>{overview.lowStockListings}</strong>
                    </p>
                    <p>
                      <span className="block text-[#8e99aa]">Out of stock</span>
                      <strong>{overview.outOfStockListings}</strong>
                    </p>
                  </div>
                </div>
              </SPAD_Panel>

              <SPAD_Panel
                title="Catalog by game"
                subtitle="Approved, active listings grouped by card game."
              >
                <div className="divide-y divide-[#edf0f4]">
                  {overview.catalogByGame.length === 0 ? (
                    <p className="px-4 py-6 text-[10px] text-[#8e99aa]">No active listings are available.</p>
                  ) : (
                    overview.catalogByGame.map((game) => (
                      <div key={game.game} className="flex justify-between px-4 py-2.5 text-[10px]">
                        <span className="font-medium text-[#303844]">{game.game}</span>
                        <strong>{game.listings} listings</strong>
                      </div>
                    ))
                  )}
                </div>
              </SPAD_Panel>
            </div>
          </>
        )}
      </div>
    </SPAD_Shell>
  );
}

export default SPAD_Overview;
