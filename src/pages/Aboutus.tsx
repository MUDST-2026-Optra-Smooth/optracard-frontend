import React from 'react';
import { useNavigate } from 'react-router-dom';

import bannerImg from '../assets/Aboutus.jpg'; 

export const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faff] pb-16 pt-6 px-4 sm:px-6 md:pt-10 md:pb-24 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm md:text-base font-semibold text-gray-700 hover:text-black mb-6 md:mb-8 flex items-center gap-1 transition"
        >
          ← Back
        </button>

        <div className="text-center mb-8 md:mb-12">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2f65ff] mb-4 md:mb-6">
            About Us
          </h1>
          {/* Description */}
          <p className="text-gray-800 font-medium max-w-4xl mx-auto leading-relaxed text-sm sm:text-base md:text-lg px-2 sm:px-0">
            Optracard จะช่วยให้ทุกคนสามารถซื้อ-ขายประมูลการ์ดเกมได้อย่างเป็นระบบ และสร้างราคากลางให้กับตลาดการ์ดเกมในประเทศไทยจากการรวบรวมประวัติการซื้อ-ขายที่เกิดขึ้นจริง เพื่อประโยชน์ของผู้เล่นและนักสะสมทุกระดับ
          </p>
        </div>

        {/* Banner Image */}
        <div className="w-full aspect-video md:aspect-[21/9] bg-gray-200 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden border border-gray-300 shadow-md">
          <img 
            src={bannerImg} 
            alt="Optracard TCG Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        
      </div>
    </div>
  );
};