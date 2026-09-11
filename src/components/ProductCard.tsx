import { useEffect, useState } from 'react';
import { formatPrice } from '../context/formatters';

interface ProductCardProps {
  title: string;
  price: number;
  game?: string;
  imageUrl?: string;
  type?: string;
  source?: 'OFFICIAL' | 'MARKETPLACE';
  storeName?: string;
  stock?: number;
}

const sourceStyle = {
  OFFICIAL: 'bg-blue-600 text-white',
  MARKETPLACE: 'bg-violet-100 text-violet-700',
};

export const ProductCard = ({
  title,
  price,
  game,
  imageUrl,
  type,
  source,
  storeName,
  stock,
}: ProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full bg-white">
      <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center mb-4 rounded-md overflow-hidden">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="px-4 text-center">
            <div className="text-3xl" aria-hidden="true">🃏</div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{type ?? 'TCG'}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600 line-clamp-2">{game ?? 'Card Game'}</p>
          </div>
        )}
        {source && (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${sourceStyle[source]}`}>
            {source === 'OFFICIAL' ? 'Official' : 'Marketplace'}
          </span>
        )}
      </div>
      
      <div className="flex flex-col flex-grow">
        {/* ปรับ Title เป็น text-base */}
        <h4 className="text-base font-semibold text-gray-900 line-clamp-2">{title}</h4>
        {/* ปรับ Price เป็น text-lg font-bold ให้เด่นขึ้น */}
        <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(price)}</p>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <div className="min-w-0">
          <span className="block truncate text-sm text-gray-500">{game}</span>
          {storeName && <span className="block truncate text-xs text-slate-400">{storeName}</span>}
          {typeof stock === 'number' && <span className="text-xs text-emerald-600">{stock} in stock</span>}
        </div>
        <button
          aria-label="Add to cart"
          className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-50 border border-transparent text-blue-600 hover:bg-blue-100 transition-colors"
        >
          🛒
        </button>
      </div>
    </div>
  );
};
