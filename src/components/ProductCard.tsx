import { formatPrice } from '../context/formatters';

interface ProductCardProps {
  title: string;
  price: number;
  game?: string;
  imageUrl?: string;
}

export const ProductCard = ({ title, price, game, imageUrl }: ProductCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full bg-white">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-md overflow-hidden">
        {imageUrl ? <img src={imageUrl} alt={title} className="max-h-full object-contain" /> : <span className="text-sm text-gray-400">[Image]</span>}
      </div>
      
      <div className="flex flex-col flex-grow">
        {/* ปรับ Title เป็น text-base */}
        <h4 className="text-base font-semibold text-gray-900 line-clamp-2">{title}</h4>
        {/* ปรับ Price เป็น text-lg font-bold ให้เด่นขึ้น */}
        <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(price)}</p>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        {/* ปรับชื่อ Game เป็น text-sm */}
        <span className="text-sm text-gray-500">{game}</span>
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