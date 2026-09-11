import { useEffect, useState } from 'react';
import { formatPrice } from '../context/formatters';

interface TradingListingCardProps {
  cardName: string;
  gameName: string;
  itemCount: number;
  startingPrice: number;
  imageUrl?: string;
  storeName?: string;
}

export const TradingListingCard = ({ cardName, gameName, itemCount, startingPrice, imageUrl, storeName }: TradingListingCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full bg-white">
      <div className="flex gap-4">
        {/* ขยายรูปภาพจาก w-16 h-20 เป็น w-20 h-28 เพื่อให้สมดุลกับ ProductCard */}
        <div className="w-20 h-28 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={cardName}
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="px-2 text-center text-xs text-gray-500">
              <div className="text-2xl" aria-hidden="true">🃏</div>
              <span className="line-clamp-3">{cardName}</span>
            </div>
          )}
        </div>
        
        <div className="flex min-w-0 flex-1 flex-col justify-start">
          {/* ปรับ Title เป็น text-base เหมือน ProductCard */}
          <p className="text-base font-semibold text-gray-900 line-clamp-2">{cardName}</p>
          {/* ปรับข้อมูลรองเป็น text-sm */}
          <p className="text-sm text-gray-500 mt-0.5">{gameName}</p>
          {storeName && <p className="text-xs text-slate-400 mt-0.5 truncate">{storeName}</p>}
          <p className="text-sm text-gray-500 mt-1">{itemCount} items</p>
          
          {/* แยกคำว่า Starting at และเน้นตัวเลขราคาเป็น text-lg font-bold เท่ากับ ProductCard */}
          <p className="text-sm text-gray-500 mt-2">
            Starting at <span className="text-lg font-bold text-gray-900 block">{formatPrice(startingPrice)}</span>
          </p>
        </div>
      </div>
      
      {/* ปรับปุ่มให้ดูหนาและคลิกง่ายขึ้น */}
      <button className="mt-5 w-full bg-blue-50 text-blue-600 py-2.5 rounded-md hover:bg-blue-100 transition-colors text-sm font-semibold">
        🛒 Add to Cart
      </button>
    </div>
  );
};
