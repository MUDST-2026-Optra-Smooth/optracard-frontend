import React, { useState, useId } from 'react';
import { BarChart3, TrendingUp, DollarSign, Table as TableIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../AdminWorkspace';

export interface MonthlyMetric {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueBarChartProps {
  metrics: MonthlyMetric[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({
  metrics = [],
  title = 'Revenue & Expenses by Month',
  subtitle = 'Derived from recorded customer orders and catalog costs.',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<{ revenue: boolean; expenses: boolean; profit: boolean }>({
    revenue: true,
    expenses: true,
    profit: true,
  });

  const gradientId = useId();

  // Summary statistics
  const totalRevenue = metrics.reduce((acc, m) => acc + (m.revenue || 0), 0);
  const totalExpenses = metrics.reduce((acc, m) => acc + (m.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const bestMonth = metrics.length > 0
    ? [...metrics].sort((a, b) => b.revenue - a.revenue)[0]
    : null;

  // Chart coordinate calculations
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...metrics.map((m) => Math.max(m.revenue || 0, m.expenses || 0, (m.revenue || 0) - (m.expenses || 0))),
    100
  );

  // Nice tick values for Y-axis (4 intervals)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: maxVal * pct,
    y: paddingTop + plotHeight * (1 - pct),
  }));

  const numItems = metrics.length;
  const slotWidth = numItems > 0 ? plotWidth / numItems : plotWidth;
  const barWidth = Math.min(Math.max(slotWidth * 0.28, 10), 32);

  const activeMetric = hoveredIdx !== null && metrics[hoveredIdx] ? metrics[hoveredIdx] : null;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Series Visibility Toggles */}
          {metrics.length > 0 && activeTab === 'chart' && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-semibold mr-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={visibleSeries.revenue}
                  onChange={(e) => setVisibleSeries((s) => ({ ...s, revenue: e.target.checked }))}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Revenue
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={visibleSeries.expenses}
                  onChange={(e) => setVisibleSeries((s) => ({ ...s, expenses: e.target.checked }))}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                Expenses
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={visibleSeries.profit}
                  onChange={(e) => setVisibleSeries((s) => ({ ...s, profit: e.target.checked }))}
                  className="rounded text-blue-500 focus:ring-blue-400"
                />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                Net Profit
              </label>
            </div>
          )}

          {/* Chart / Table View toggle buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                activeTab === 'chart'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Show Bar Chart"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                activeTab === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Show Table"
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-slate-100 text-xs">
          <div className="px-2">
            <span className="text-slate-400 block font-medium">Total Revenue</span>
            <span className="font-bold text-slate-900 text-sm text-emerald-600">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="px-2">
            <span className="text-slate-400 block font-medium">Total Expenses</span>
            <span className="font-bold text-slate-900 text-sm text-rose-600">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="px-2">
            <span className="text-slate-400 block font-medium">Net Profit</span>
            <span className="font-bold text-slate-900 text-sm text-blue-600">{formatCurrency(totalProfit)}</span>
          </div>
          <div className="px-2">
            <span className="text-slate-400 block font-medium">Best Month</span>
            <span className="font-bold text-slate-900 text-sm">
              {bestMonth ? `${bestMonth.month} (${formatCurrency(bestMonth.revenue)})` : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {metrics.length === 0 ? (
        <div className="py-14 text-center">
          <DollarSign className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No monthly financial metrics recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">Financial data will automatically visualize once orders are processed.</p>
        </div>
      ) : activeTab === 'chart' ? (
        /* SVG Interactive Chart View */
        <div className="relative mt-4">
          {/* Hover Popover Tooltip */}
          {activeMetric && (
            <div className="absolute top-1 right-2 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs text-xs pointer-events-none transition-all">
              <p className="font-bold text-slate-900 text-sm mb-1">{activeMetric.month}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Revenue:
                  </span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(activeMetric.revenue)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Expenses:
                  </span>
                  <span className="font-semibold text-rose-700">{formatCurrency(activeMetric.expenses)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Net Profit:
                  </span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(activeMetric.revenue - activeMetric.expenses)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[500px]"
              aria-label="Monthly Revenue and Expenses Chart"
            >
              <defs>
                <linearGradient id={`${gradientId}-rev`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id={`${gradientId}-exp`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
                <linearGradient id={`${gradientId}-prof`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and Y-axis Ticks */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={chartWidth - paddingRight}
                    y2={tick.y}
                    stroke="#e2e8f0"
                    strokeDasharray={i === 0 ? undefined : '3 3'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    ฿{tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : tick.val.toFixed(0)}
                  </text>
                </g>
              ))}

              {/* Data Bars */}
              {metrics.map((m, idx) => {
                const centerX = paddingLeft + idx * slotWidth + slotWidth / 2;
                const isHovered = hoveredIdx === idx;

                const revHeight = Math.max((m.revenue / maxVal) * plotHeight, 2);
                const expHeight = Math.max((m.expenses / maxVal) * plotHeight, 2);
                const prof = m.revenue - m.expenses;
                const profHeight = Math.max((Math.max(prof, 0) / maxVal) * plotHeight, 2);

                const revY = paddingTop + plotHeight - revHeight;
                const expY = paddingTop + plotHeight - expHeight;
                const profY = paddingTop + plotHeight - profHeight;

                // Offsets for side-by-side display
                const showCount = [visibleSeries.revenue, visibleSeries.expenses, visibleSeries.profit].filter(Boolean).length;
                let revX = centerX - barWidth / 2;
                let expX = centerX - barWidth / 2;
                let profX = centerX - barWidth / 2;

                if (showCount === 3) {
                  revX = centerX - barWidth * 1.5 - 2;
                  expX = centerX - barWidth / 2;
                  profX = centerX + barWidth / 2 + 2;
                } else if (showCount === 2) {
                  if (visibleSeries.revenue && visibleSeries.expenses) {
                    revX = centerX - barWidth - 1;
                    expX = centerX + 1;
                  } else if (visibleSeries.revenue && visibleSeries.profit) {
                    revX = centerX - barWidth - 1;
                    profX = centerX + 1;
                  } else {
                    expX = centerX - barWidth - 1;
                    profX = centerX + 1;
                  }
                }

                return (
                  <g
                    key={m.month}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    opacity={hoveredIdx !== null && !isHovered ? 0.45 : 1}
                  >
                    {/* Hover highlight background column */}
                    {isHovered && (
                      <rect
                        x={centerX - slotWidth / 2 + 2}
                        y={paddingTop}
                        width={slotWidth - 4}
                        height={plotHeight}
                        fill="#f1f5f9"
                        rx="6"
                      />
                    )}

                    {/* Revenue Bar */}
                    {visibleSeries.revenue && (
                      <rect
                        x={revX}
                        y={revY}
                        width={barWidth}
                        height={revHeight}
                        fill={`url(#${gradientId}-rev)`}
                        rx="3"
                      />
                    )}

                    {/* Expenses Bar */}
                    {visibleSeries.expenses && (
                      <rect
                        x={expX}
                        y={expY}
                        width={barWidth}
                        height={expHeight}
                        fill={`url(#${gradientId}-exp)`}
                        rx="3"
                      />
                    )}

                    {/* Net Profit Bar */}
                    {visibleSeries.profit && (
                      <rect
                        x={profX}
                        y={profY}
                        width={barWidth}
                        height={profHeight}
                        fill={`url(#${gradientId}-prof)`}
                        rx="3"
                      />
                    )}

                    {/* X-axis Month Label */}
                    <text
                      x={centerX}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fill={isHovered ? '#1e293b' : '#64748b'}
                      fontFamily="inherit"
                    >
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        /* Tabular View */
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Month</th>
                <th className="pb-3 text-right font-semibold">Revenue</th>
                <th className="pb-3 text-right font-semibold">Expenses</th>
                <th className="pb-3 text-right font-semibold">Net Profit</th>
                <th className="pb-3 text-right font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((metric) => {
                const profit = metric.revenue - metric.expenses;
                const margin = metric.revenue > 0 ? (profit / metric.revenue) * 100 : 0;
                return (
                  <tr key={metric.month} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-semibold text-slate-800">{metric.month}</td>
                    <td className="py-3 text-right text-emerald-600 font-medium">
                      {formatCurrency(metric.revenue)}
                    </td>
                    <td className="py-3 text-right text-rose-600 font-medium">
                      {formatCurrency(metric.expenses)}
                    </td>
                    <td className="py-3 text-right font-bold text-blue-600">
                      {formatCurrency(profit)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {margin >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RevenueBarChart;
