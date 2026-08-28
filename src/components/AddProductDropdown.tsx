import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Check, Package } from 'lucide-react';

interface AddProductDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Single Card',
  'Booster Box',
  'Booster Pack',
  'Accessories',
];

export const AddProductDropdown: React.FC<AddProductDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Single Card');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟังก์ชันย้ายหน้าเมื่อกดปุ่ม Select
  const handleSelect = () => {
    navigate('/add-product', { state: { productType: selectedType } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* หัวข้อ Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Select Product Type</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ช่อง Search */}
        <div className="relative mt-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search category (e.g. Card, Booster)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* รายการตัวเลือก */}
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {filteredCategories.map((type) => {
            const isSelected = selectedType === type;
            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition text-sm font-medium ${
                  isSelected
                    ? 'border-2 border-slate-900 bg-blue-50/40 text-blue-600'
                    : 'border border-transparent text-slate-700 hover:bg-gray-50'
                }`}
              >
                <span>{type}</span>
                {isSelected && <Check size={18} className="text-blue-600 stroke-[2.5]" />}
              </div>
            );
          })}
        </div>

        {/* ปุ่ม Cancel และ Select */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSelect}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            Select
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddProductDropdown;