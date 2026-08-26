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
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full bg-white">
      <div className="flex gap-4">
        {/* ขยายรูปภาพจาก w-16 h-20 เป็น w-20 h-28 เพื่อให้สมดุลกับ ProductCard */}
        <div className="w-20 h-28 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? <img src={imageUrl} alt={cardName} className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400">[Image]</span>}
        </div>
        
        <div className="flex flex-col justify-start w-full">
          {/* ปรับ Title เป็น text-base เหมือน ProductCard */}
          <p className="text-base font-semibold text-gray-900 line-clamp-2">{cardName}</p>
          {/* ปรับข้อมูลรองเป็น text-sm */}
          <p className="text-sm text-gray-500 mt-0.5">{gameName}</p>
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