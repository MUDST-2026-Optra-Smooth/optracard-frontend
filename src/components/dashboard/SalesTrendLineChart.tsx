import React, { useState, useId } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../AdminWorkspace';

export interface SalesDataPoint {
  label: string; // e.g. "Day 1", "Mon", "Oct 12"
  revenue: number;
  orders: number;
}

interface SalesTrendLineChartProps {
  data: SalesDataPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SalesTrendLineChart: React.FC<SalesTrendLineChartProps> = ({
  data = [],
  title = 'Sales & Revenue Trend',
  subtitle = 'Order volume and gross sales trajectory over time.',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const gradientId = useId();

  const totalSales = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.orders || 0), 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0), 100);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Calculate points
  const points = data.map((d, i) => {
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = padTop + plotHeight - ((d.revenue || 0) / maxRevenue) * plotHeight;
    return { x, y, ...d };
  });

  // Construct SVG path strings
  const linePath = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`
    : '';

  const hoveredPoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <span className="font-semibold text-slate-800">Gross Sales: {formatCurrency(totalSales)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{totalOrders} Orders</span>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto h-9 w-9 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No trend data available.</p>
          <p className="text-xs text-slate-400 mt-1">Timeline activity will populate as orders are recorded.</p>
        </div>
      ) : (
        <div className="relative mt-4">
          {/* Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-0 right-2 z-10 rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-md backdrop-blur-xs text-xs pointer-events-none">
              <p className="font-bold text-slate-900">{hoveredPoint.label}</p>
              <div className="mt-1 space-y-0.5">
                <p className="text-indigo-600 font-bold">Revenue: {formatCurrency(hoveredPoint.revenue)}</p>
                <p className="text-slate-500">{hoveredPoint.orders} order(s)</p>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[480px]"
              aria-label="Sales Trend Line Chart"
            >
              <defs>
                <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((pct, i) => {
                const y = padTop + plotHeight * (1 - pct);
                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padLeft - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                    >
                      ฿{((maxRevenue * pct) / (maxRevenue >= 1000 ? 1000 : 1)).toFixed(0)}
                      {maxRevenue >= 1000 ? 'k' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              {areaPath && (
                <path d={areaPath} fill={`url(#${gradientId}-area)`} />
              )}

              {/* Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Dots */}
              {points.map((p, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="#6366f1"
                        opacity="0.2"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? '5' : '3.5'}
                      fill="#ffffff"
                      stroke="#4f46e5"
                      strokeWidth={isHovered ? '3' : '2'}
                      className="transition-all"
                    />
                    {/* X-axis label */}
                    <text
                      x={p.x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fill={isHovered ? '#1e293b' : '#64748b'}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTrendLineChart;
