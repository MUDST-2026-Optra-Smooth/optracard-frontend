import { useEffect, useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { loadCatalogFilterOptions } from '../api/catalog';

type FilterOptions = {
  types: string[];
  games: { id: number; name: string }[];
  languages: string[];
  sources: string[];
};

const fallbackOptions: FilterOptions = {
  types: ['Single', 'Booster', 'Booster Box', 'Accessories'],
  games: ['Pokemon', 'One Piece', 'Magic: The Gathering', 'Yu-Gi-Oh!'].map((name, id) => ({ id, name })),
  languages: ['English', 'Japanese', 'Thai'],
  sources: ['OFFICIAL', 'MARKETPLACE'],
};

interface CatalogFilterDrawerProps {
  open: boolean;
  initialParams: URLSearchParams;
  lockedSource?: 'OFFICIAL' | 'MARKETPLACE';
  onClose: () => void;
  onApply: (params: URLSearchParams) => void;
}

const withLockedSource = (params: URLSearchParams, lockedSource?: 'OFFICIAL' | 'MARKETPLACE') => {
  const next = new URLSearchParams(params);
  if (lockedSource) next.set('source', lockedSource);
  return next;
};

export function CatalogFilterDrawer({ open, initialParams, lockedSource, onClose, onApply }: CatalogFilterDrawerProps) {
  const [draft, setDraft] = useState(() => withLockedSource(initialParams, lockedSource));
  const [options, setOptions] = useState<FilterOptions>(fallbackOptions);

  useEffect(() => {
    if (!open) return;
    setDraft(withLockedSource(initialParams, lockedSource));
    void loadCatalogFilterOptions()
      .then((loaded) => setOptions({
        types: loaded.types.length ? loaded.types : fallbackOptions.types,
        games: loaded.games.length ? loaded.games : fallbackOptions.games,
        languages: loaded.languages.length ? loaded.languages : fallbackOptions.languages,
        sources: loaded.sources.length ? loaded.sources : fallbackOptions.sources,
      }))
      .catch(() => setOptions(fallbackOptions));
  }, [open, initialParams.toString(), lockedSource]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const setFilter = (key: string, value: string) => {
    setDraft((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
  };

  const clear = () => setDraft(withLockedSource(new URLSearchParams(), lockedSource));

  const minPrice = parsePrice(draft.get('minPrice'));
  const maxPrice = parsePrice(draft.get('maxPrice'));
  const hasInvalidPriceRange = minPrice !== null && maxPrice !== null && minPrice > maxPrice;

  const apply = () => {
    if (!hasInvalidPriceRange) onApply(withLockedSource(draft, lockedSource));
  };

  return (
    <>
      <button type="button" aria-label="Close filters" onClick={onClose} className="fixed inset-0 z-[70] bg-black/35" />
      <aside aria-label="Catalog filters" className="fixed inset-y-0 left-0 z-[80] flex w-[min(420px,92vw)] flex-col bg-white text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-2 text-xl font-bold"><SlidersHorizontal className="h-5 w-5 text-blue-600" /> Filters</div>
          <button type="button" aria-label="Close filters" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <FilterSelect label="Product type" value={draft.get('type') ?? ''} onChange={(value) => setFilter('type', value)} options={options.types} />
          <FilterSelect label="Game" value={draft.get('game') ?? ''} onChange={(value) => setFilter('game', value)} options={options.games.map((game) => game.name)} />
          <FilterSelect label="Language" value={draft.get('language') ?? ''} onChange={(value) => setFilter('language', value)} options={options.languages} />
          <FilterSelect label="Store source" value={draft.get('source') ?? ''} onChange={(value) => setFilter('source', value)} options={options.sources} disabled={Boolean(lockedSource)} />
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-600">Price range</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" max={maxPrice ?? undefined} aria-invalid={hasInvalidPriceRange} value={draft.get('minPrice') ?? ''} onChange={(event) => setFilter('minPrice', event.target.value)} placeholder="Min Price" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500" />
              <input type="number" min={minPrice ?? 0} aria-invalid={hasInvalidPriceRange} value={draft.get('maxPrice') ?? ''} onChange={(event) => setFilter('maxPrice', event.target.value)} placeholder="Max Price" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500" />
            </div>
            {hasInvalidPriceRange && <p className="mt-2 text-sm text-red-600" role="alert">Minimum price cannot exceed maximum price.</p>}
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-6 py-5">
          <button type="button" onClick={clear} className="flex-1 rounded-full border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50">Clear all</button>
          <button type="button" disabled={hasInvalidPriceRange} onClick={apply} className="flex-1 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">Apply filters</button>
        </div>
      </aside>
    </>
  );
}

function FilterSelect({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block text-sm font-semibold text-slate-600">{label}<select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>{disabled && <span className="mt-1 block text-xs font-normal text-slate-500">Locked to this page's catalog.</span>}</label>;
}

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}
