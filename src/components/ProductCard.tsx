// src/components/ProductCard.tsx
import React from 'react';

export interface ProductCardProps {
  variant: 'marketplace' | 'official';
  title: string;
  subtitle?: string; // ชื่อซีรีส์ หรือ เกม (เช่น One Piece, Battle of Yaoyorozu)
  price?: number; // สำหรับ Official Store
  startingPrice?: number; // สำหรับ Marketplace
  itemsCount?: number; // สำหรับ Marketplace
  imageUrl?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  variant,
  title,
  subtitle,
  price,
  startingPrice,
  itemsCount, 
  imageUrl,
}) => {
  // ----------------------------------------
  // แบบแนวนอน: Marketplace & Trading
  // ----------------------------------------
  if (variant === 'marketplace') {
    return (
      <div className="border border-gray-200 rounded-lg p-3 flex gap-4 bg-white hover:shadow-md transition">
        <div className="w-24 h-32 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
          {imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">Image</span>}
        </div>
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{itemsCount} items.</span>
              <span>Starting at ฿{startingPrice?.toLocaleString()}</span>
            </div>
            <button className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-1.5 rounded text-sm font-medium hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // แบบแนวตั้ง: Official Store
  // ----------------------------------------
  return (
    <div className="flex flex-col group bg-white">
      <div className="w-full aspect-[3/4] bg-[#f0f0f0] rounded-lg flex items-center justify-center mb-3 overflow-hidden p-4">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-gray-400">Image</span>
        )}
      </div>
      <div className="flex justify-between items-start gap-2 px-1">
        <div>
          <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{title}</h4>
          <p className="text-sm font-bold text-gray-900 mt-1">฿{price?.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <button className="text-blue-500 hover:text-blue-700 transition p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};