import { formatPrice } from '../context/formatters';

interface TradingListingCardProps {
  cardName: string;
  gameName: string;
  itemCount: number;
  startingPrice: number;
  imageUrl?: string;
}

export const TradingListingCard = ({ cardName, gameName, itemCount, startingPrice, imageUrl }: TradingListingCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          {imageUrl ? <img src={imageUrl} alt={cardName} className="w-full h-full object-cover rounded" /> : <span className="text-xs text-gray-400">[Image]</span>}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-900">{cardName}</p>
          <p className="text-xs text-gray-400">{gameName}</p>
          <p className="text-xs text-gray-500 mt-1">{itemCount} items</p>
          <p className="text-xs text-gray-500">Starting at {formatPrice(startingPrice)}</p>
        </div>
      </div>
      <button className="mt-4 w-full bg-blue-100 text-blue-600 py-2 rounded-md hover:bg-blue-200 transition text-sm">
        🛒 Add to Cart
      </button>
    </div>
  );
};