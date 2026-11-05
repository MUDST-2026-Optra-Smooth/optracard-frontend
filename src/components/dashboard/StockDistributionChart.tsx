import React from 'react';
import { Boxes, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface GameListing {
  game: string;
  listings: number;
}

interface StockDistributionChartProps {
  products?: Array<{ game?: string; stock?: number; active?: boolean }>;
  inStockCount?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  catalogByGame?: GameListing[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const GAME_COLORS: Record<string, string> = {
  Pokemon: '#3b82f6',
  'One Piece': '#ef4444',
  'Yu-Gi-Oh!': '#f59e0b',
  'Magic: The Gathering': '#8b5cf6',
  Other: '#64748b',
};

export const StockDistributionChart: React.FC<StockDistributionChartProps> = ({
  products,
  inStockCount: explicitInStock,
  lowStockCount: explicitLowStock,
  outOfStockCount: explicitOutOfStock,
  catalogByGame: explicitGames,
  title = 'Inventory & Game Distribution',
  subtitle = 'Stock levels and catalog composition by trading card game.',
  className = '',
}) => {
  // Compute stock levels if raw products array is provided
  let inStock = explicitInStock ?? 0;
  let lowStock = explicitLowStock ?? 0;
  let outOfStock = explicitOutOfStock ?? 0;

  let games: GameListing[] = explicitGames || [];

  if (products && products.length > 0) {
    inStock = products.filter((p) => (p.stock || 0) > 3).length;
    lowStock = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 3).length;
    outOfStock = products.filter((p) => (p.stock || 0) === 0).length;

    if (!explicitGames) {
      const counts: Record<string, number> = {};
      products.forEach((p) => {
        const g = p.game || 'Other';
        counts[g] = (counts[g] || 0) + 1;
      });
      games = Object.entries(counts).map(([game, listings]) => ({ game, listings }));
    }
  }

  const totalListings = inStock + lowStock + outOfStock;
  const healthRate = totalListings > 0 ? ((inStock / totalListings) * 100).toFixed(0) : '100';

  const inStockPct = totalListings > 0 ? (inStock / totalListings) * 100 : 0;
  const lowStockPct = totalListings > 0 ? (lowStock / totalListings) * 100 : 0;
  const outOfStockPct = totalListings > 0 ? (outOfStock / totalListings) * 100 : 0;

  const totalGameListings = games.reduce((sum, g) => sum + g.listings, 0);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{healthRate}% Health</span>
        </div>
      </div>

      {totalListings === 0 && games.length === 0 ? (
        <div className="py-12 text-center">
          <Boxes className="mx-auto h-9 w-9 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No inventory data to display.</p>
          <p className="text-xs text-slate-400 mt-1">Listed products will show their stock health and game distribution here.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {/* Stock Health Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
              <span>Overall Stock Health</span>
              <span>{totalListings} total product listings</span>
            </div>

            {/* Proportional Segmented Bar */}
            <div className="h-3.5 w-full flex rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
              {inStockPct > 0 && (
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${inStockPct}%` }}
                  title={`In Stock: ${inStock} (${inStockPct.toFixed(0)}%)`}
                />
              )}
              {lowStockPct > 0 && (
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${lowStockPct}%` }}
                  title={`Low Stock: ${lowStock} (${lowStockPct.toFixed(0)}%)`}
                />
              )}
              {outOfStockPct > 0 && (
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${outOfStockPct}%` }}
                  title={`Out of Stock: ${outOfStock} (${outOfStockPct.toFixed(0)}%)`}
                />
              )}
            </div>

            {/* Pill breakdown */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>In Stock</span>
                </div>
                <p className="mt-1 text-base font-extrabold text-emerald-900">{inStock}</p>
                <p className="text-[10px] text-emerald-600 font-medium">{inStockPct.toFixed(0)}% of catalog</p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-700 font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Low Stock</span>
                </div>
                <p className="mt-1 text-base font-extrabold text-amber-900">{lowStock}</p>
                <p className="text-[10px] text-amber-600 font-medium">≤ 3 remaining</p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-700 font-bold">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Out of Stock</span>
                </div>
                <p className="mt-1 text-base font-extrabold text-rose-900">{outOfStock}</p>
                <p className="text-[10px] text-rose-600 font-medium">0 remaining</p>
              </div>
            </div>
          </div>

          {/* Card Game Composition */}
          {games.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-3">
                <span>Catalog by Card Game</span>
                <span>{games.length} Categories</span>
              </div>

              {/* Multi-segment Game Bar */}
              <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-100 mb-4 gap-0.5">
                {games.map((g) => {
                  const pct = totalGameListings > 0 ? (g.listings / totalGameListings) * 100 : 0;
                  const color = GAME_COLORS[g.game] || GAME_COLORS.Other;
                  return (
                    <div
                      key={g.game}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      title={`${g.game}: ${g.listings} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>

              {/* Game listings */}
              <div className="space-y-2">
                {games.map((g) => {
                  const pct = totalGameListings > 0 ? (g.listings / totalGameListings) * 100 : 0;
                  const color = GAME_COLORS[g.game] || GAME_COLORS.Other;
                  return (
                    <div key={g.game} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-800">{g.game}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{g.listings} listings</span>
                        <span className="font-bold text-slate-900 w-9 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockDistributionChart;

