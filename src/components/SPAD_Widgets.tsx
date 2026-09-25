import { useState } from 'react';
import type { DragEventHandler, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type SPAD_StatTone = 'blue' | 'teal' | 'green' | 'orange' | 'purple';

interface SPAD_StatCardProps {
  label: string;
  value: string;
  detail?: string;
  tone?: SPAD_StatTone;
  variant?: 'plain' | 'gradient';
  dragHandle?: {
    label?: string;
    onDragStart: DragEventHandler<HTMLButtonElement>;
    onDragEnd: DragEventHandler<HTMLButtonElement>;
  };
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onDragLeave?: DragEventHandler<HTMLDivElement>;
  isDragging?: boolean;
  isDragOver?: boolean;
}

interface SPAD_PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const plainToneStyles: Record<SPAD_StatTone, string> = {
  blue: 'bg-[#edf4ff] text-[#2f65ff]',
  teal: 'bg-[#e8f8f1] text-[#159568]',
  green: 'bg-[#e8f8f1] text-[#159568]',
  orange: 'bg-[#fff4e4] text-[#c27b1b]',
  purple: 'bg-[#f0ebff] text-[#7659c9]',
};

const gradientToneStyles: Record<SPAD_StatTone, string> = {
  blue: 'from-[#2260d8] to-[#347cff]',
  teal: 'from-[#149d7f] to-[#27b493]',
  green: 'from-[#149d7f] to-[#27b493]',
  orange: 'from-[#f7931e] to-[#ffac22]',
  purple: 'from-[#6c43b7] to-[#8060ca]',
};

export const SPAD_StatCard = ({
  label,
  value,
  detail,
  tone = 'blue',
  variant = 'plain',
  dragHandle,
  onDragOver,
  onDrop,
  onDragLeave,
  isDragging = false,
  isDragOver = false,
}: SPAD_StatCardProps) => {
  const isGradient = variant === 'gradient';

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`rounded-lg border p-4 shadow-[0_2px_8px_rgba(27,39,63,0.04)] transition ${
        isGradient ? `border-transparent bg-gradient-to-br ${gradientToneStyles[tone]} text-white` : 'border-[#e1e6ee] bg-white'
      } ${isDragging ? 'scale-[0.98] opacity-45' : ''} ${isDragOver ? 'border-[#2f65ff] ring-2 ring-[#2f65ff]/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[9px] font-bold uppercase tracking-[0.08em] ${isGradient ? 'text-white/70' : 'text-[#8e99aa]'}`}>{label}</p>
        {dragHandle ? (
          <button
            type="button"
            draggable
            onDragStart={dragHandle.onDragStart}
            onDragEnd={dragHandle.onDragEnd}
            aria-label={dragHandle.label ?? `Drag ${label} card`}
            title="Drag to reorder"
            className={`rounded-md px-2 py-1 text-[9px] font-bold ${isGradient ? 'bg-white/15 text-white' : plainToneStyles[tone]} cursor-grab touch-none select-none active:cursor-grabbing`}
          >
            •••
          </button>
        ) : null}
      </div>
      <p className={`mt-2 text-2xl font-black tracking-tight ${isGradient ? 'text-white' : 'text-[#202735]'}`}>{value}</p>
      {detail && <p className={`mt-1 text-[9px] ${isGradient ? 'text-white/65' : 'text-[#159568]'}`}>{detail}</p>}
    </div>
  );
};

export const SPAD_Panel = ({ title, subtitle, action, children, className = '' }: SPAD_PanelProps) => (
  <section className={`rounded-lg border border-[#e1e6ee] bg-white shadow-[0_2px_8px_rgba(27,39,63,0.04)] ${className}`}>
    <div className="flex items-start justify-between gap-4 border-b border-[#edf0f4] px-4 py-3.5">
      <div>
        <h2 className="text-xs font-bold text-[#263142]">{title}</h2>
        {subtitle && <p className="mt-1 text-[9px] text-[#8e99aa]">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const SPAD_StatusBadge = ({ label, tone = 'neutral' }: { label: string; tone?: 'blue' | 'green' | 'orange' | 'red' | 'neutral' }) => {
  const colors = {
    blue: 'bg-[#edf4ff] text-[#2f65ff]',
    green: 'bg-[#e8f8f1] text-[#159568]',
    orange: 'bg-[#fff4dc] text-[#b47a00]',
    red: 'bg-[#fff0f0] text-[#dc4c4c]',
    neutral: 'bg-[#f0f2f5] text-[#687486]',
  };

  return <span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-bold ${colors[tone]}`}>• {label}</span>;
};

export const SPAD_SectionHeading = ({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      {eyebrow && <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#2f65ff]">{eyebrow}</p>}
      <h1 className="mt-1 text-xl font-black tracking-tight text-[#182131] sm:text-2xl">{title}</h1>
      {description && <p className="mt-1 text-[9px] text-[#8e99aa]">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export const SPAD_FilterBar = ({ children }: { children: ReactNode }) => (
  <div className="rounded-lg border border-[#e1e6ee] bg-white p-3 shadow-[0_2px_8px_rgba(27,39,63,0.03)]">
    <div className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto]">{children}</div>
  </div>
);

export const SPAD_FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[8px] font-bold text-[#687486]">{label}</span>
    {children}
  </label>
);

export const SPAD_Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-[9px] font-bold text-[#687486]">{label}</span>
    {children}
  </label>
);

export const SPAD_Pagination = ({ count = 'Showing 1–5 of 124 results', pageCount = 21 }: { count?: string; pageCount?: number }) => {
  const [page, setPage] = useState(1);
  const setSafePage = (nextPage: number) => setPage(Math.min(pageCount, Math.max(1, nextPage)));
  const pageButtons = Array.from(new Set([1, 2, 3, pageCount])).filter((pageNumber) => pageNumber <= pageCount);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#edf0f4] px-4 py-3 text-[8px] text-[#9aa3b1]">
      <span>{count} · Page {page}</span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setSafePage(page - 1)} className="h-6 min-w-6 rounded border border-[#e1e6ee] px-1 text-[#687486] disabled:cursor-not-allowed disabled:opacity-40">‹</button>
        {pageButtons.map((pageNumber, index) => <span key={pageNumber}>{index > 2 && pageNumber - pageButtons[index - 1] > 1 ? <span className="px-1">…</span> : null}<button type="button" aria-label={`Go to page ${pageNumber}`} onClick={() => setSafePage(pageNumber)} className={`h-6 min-w-6 rounded border px-1 ${page === pageNumber ? 'border-[#2f65ff] bg-[#2f65ff] font-bold text-white' : 'border-[#e1e6ee] text-[#687486]'}`}>{pageNumber}</button></span>)}
        <button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => setSafePage(page + 1)} className="h-6 min-w-6 rounded border border-[#e1e6ee] px-1 text-[#687486] disabled:cursor-not-allowed disabled:opacity-40">›</button>
      </div>
    </div>
  );
};

export const SPAD_ExportButton = ({ label, fileName, rows }: { label: string; fileName: string; rows: Array<Record<string, string | number>> }) => {
  const handleExport = () => {
    const columns = Object.keys(rows[0] ?? {});
    const csv = [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ''))]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <button type="button" onClick={handleExport} className="rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[8px] font-bold text-[#687486] hover:border-[#2f65ff] hover:text-[#2f65ff]">{label}</button>;
};

export const SPAD_Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#263142] outline-none placeholder:text-[#b1bac7] focus:border-[#2f65ff] ${props.className ?? ''}`} />
);

export const SPAD_Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486] outline-none focus:border-[#2f65ff] ${props.className ?? ''}`} />
);
