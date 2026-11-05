import React, { useState } from 'react';
import { PieChart, CheckCircle2, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react';

export interface OrderStatusDistribution {
  status: string;
  count: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}

interface OrderStatusDonutChartProps {
  orders?: Array<{ status?: string }>;
  counts?: Record<string, number>;
  title?: string;
  subtitle?: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  Processing: {
    label: 'Processing',
    color: '#3b82f6',
    icon: Clock,
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  Shipped: {
    label: 'Shipped',
    color: '#f59e0b',
    icon: Truck,
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  Delivered: {
    label: 'Delivered',
    color: '#10b981',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Canceled: {
    label: 'Canceled',
    color: '#ef4444',
    icon: XCircle,
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const OrderStatusDonutChart: React.FC<OrderStatusDonutChartProps> = ({
  orders,
  counts,
  title = 'Order Status Distribution',
  subtitle = 'Fulfillment lifecycle breakdown across recorded orders.',
  className = '',
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Compute status counts either from passed orders or direct count map
  const rawCounts: Record<string, number> = counts
    ? { ...counts }
    : (orders || []).reduce((acc, order) => {
        const s = order.status || 'Processing';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

  const totalOrders = Object.values(rawCounts).reduce((sum, count) => sum + count, 0);

  // Prepare ordered slices
  const segments = Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
    const count = rawCounts[key] || 0;
    const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
    return {
      status: key,
      label: cfg.label,
      count,
      percentage,
      color: cfg.color,
      icon: cfg.icon,
      tone: cfg.tone,
    };
  });

  // Calculate SVG stroke dashes for circle donut (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const renderedSlices = segments.map((seg) => {
    const strokeDash = (seg.percentage / 100) * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += strokeDash;
    return {
      ...seg,
      strokeDash,
      offset,
    };
  });

  const activeSegment = hoveredStatus
    ? segments.find((s) => s.status === hoveredStatus)
    : null;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {totalOrders === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No orders to visualize yet.</p>
          <p className="text-xs text-slate-400 mt-1">Status distribution will appear when customer orders are placed.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 180 180"
              className="h-44 w-44 -rotate-90 transform"
              aria-label="Order status donut chart"
            >
              {/* Background circle track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {renderedSlices.map((slice) => {
                if (slice.count === 0) return null;
                const isHovered = hoveredStatus === slice.status;
                return (
                  <circle
                    key={slice.status}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${slice.strokeDash} ${circumference - slice.strokeDash}`}
                    strokeDashoffset={-slice.offset}
                    strokeLinecap="butt"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredStatus(slice.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    style={{
                      opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                    }}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSegment ? (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {activeSegment.label}
                  </span>
                  <span className="text-2xl font-black text-slate-900">{activeSegment.count}</span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeSegment.percentage.toFixed(0)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
                  <span className="text-2xl font-black text-slate-900">{totalOrders}</span>
                  <span className="text-xs font-medium text-slate-500">Orders</span>
                </>
              )}
            </div>
          </div>

          {/* Legend and Progress Details */}
          <div className="space-y-3">
            {segments.map((seg) => {
              const Icon = seg.icon;
              const isHovered = hoveredStatus === seg.status;
              return (
                <div
                  key={seg.status}
                  onMouseEnter={() => setHoveredStatus(seg.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className={`flex items-center justify-between rounded-xl p-2.5 transition cursor-pointer border ${
                    isHovered ? 'bg-slate-50 border-slate-300 shadow-2xs' : 'border-transparent hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${seg.color}15`, color: seg.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{seg.label}</p>
                      <p className="text-[10px] text-slate-500">{seg.count} {seg.count === 1 ? 'order' : 'orders'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-slate-700">
                      {seg.percentage.toFixed(0)}%
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusDonutChart;

