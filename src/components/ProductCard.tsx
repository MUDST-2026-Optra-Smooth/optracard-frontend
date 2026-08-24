import { formatPrice } from '../context/formatters';

interface ProductCardProps {
  title: string;
  price: number;
  game?: string;
  imageUrl?: string;
}

export const ProductCard = ({ title, price, game, imageUrl }: ProductCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4">
        {imageUrl ? <img src={imageUrl} alt={title} className="max-h-full" /> : <span>[Image]</span>}
      </div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-lg font-bold text-gray-800 mt-2">{formatPrice(price)}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{game}</span>
        <button
          aria-label="Add to cart"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
        >
          🛒
        </button>
      </div>
    </div>
  );
};