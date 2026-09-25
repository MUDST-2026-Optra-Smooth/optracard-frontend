import type { ReactNode } from 'react';

interface OrderDetailPanelProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const OrderDetailPanel = ({
  title,
  subtitle,
  headerRight,
  children,
  className = '',
}: OrderDetailPanelProps) => {
  return (
    <section className={`rounded-xl border border-[#e4e8ee] bg-white shadow-[0_3px_12px_rgba(27,39,63,0.05)] ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-[#edf0f4] px-5 py-3.5">
        <div>
          <h2 className="text-xs font-bold text-[#2d3440]">{title}</h2>
          {subtitle && <p className="mt-1 text-[10px] text-[#a1a8b3]">{subtitle}</p>}
        </div>
        {headerRight && <div className="text-right">{headerRight}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
};
