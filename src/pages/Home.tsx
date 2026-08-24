// src/pages/Home.tsx
import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { mockMarketplaceData, mockOfficialSingle, mockOfficialBooster, mockOfficialBox, mockOfficialAccessories } from '../utils/mockData';

export const Home = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 font-sans">
      
      {/* 1. Hero Banner Placeholder */}
      <div className="w-full h-48 md:h-[350px] bg-gradient-to-r from-yellow-300 via-red-300 to-blue-400 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-sm mb-10 relative overflow-hidden">
        <span>🎉 สนุกกับโปเกมอนการ์ด</span>
        {/* ปุ่มซ้ายขวา */}
        <button className="absolute left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center opacity-80 hover:opacity-100">←</button>
        <button className="absolute right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center opacity-80 hover:opacity-100">→</button>
      </div>

      {/* 2. Marketplace Section */}
      <section className="mb-14">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-blue-600">Marketplace & Trading</h2>
          </div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 absolute right-8 md:right-auto">
            View All →
          </button>
        </div>
        {/* ตารางแนวนอน 3 คอลัมน์บน Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMarketplaceData.map((item, index) => (
            <ProductCard key={index} {...item} />
          ))}
        </div>
      </section>

      {/* 3. Official Store Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600">Optracard Official Store</h2>
        </div>

        {/* Sub-section Template */}
        {[
          { title: 'Single', data: mockOfficialSingle },
          { title: 'Booster', data: mockOfficialBooster },
          { title: 'Booster Box', data: mockOfficialBox },
          { title: 'Accessories', data: mockOfficialAccessories },
        ].map((section, idx) => (
          <div key={idx} className="mb-10">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                View All →
              </button>
            </div>
            {/* ตารางแนวตั้ง 4 คอลัมน์บน Desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {section.data.map((item, i) => (
                <ProductCard key={i} {...item} />
              ))}
            </div>
          </div>
        ))}
      </section>

    </div>
  );
};