import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddProductDropdown from '../components/AddProductDropdown';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  stocks: number;
  cost: string;
  price: string;
  profit: string;
  cardCode?: string;
  set?: string;
  setCode?: string;
  productType?: string;
  language?: string;
  description?: string;
  imageUrl?: string;
}

const mockProducts: ProductItem[] = [
  {
    id: 'PD-0001',
    name: 'Charizard ex',
    category: 'Pokémon',
    stocks: 5,
    cost: '฿1,000',
    price: '฿1,500',
    profit: '฿500',
    cardCode: '006/165',
    set: 'Scarlet & Violet 151',
    setCode: 'sv3pt5',
    productType: 'Pokémon',
    language: 'English',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
    description: `[Type] Fire
[HP] 330
[Stage] Stage 2 – Evolves from Charmeleon
[Rarity] Double Rare
[Brave Wing] 60+ If this Pokémon has any damage counters on it, this attack does 100 more damage.
[Explosive Vortex] 330 Discard 3 Energy from this Pokémon.
[Pokémon ex Rule] When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.
[Weakness] Water ×2
[Resistance] None
[Retreat Cost] 2
[Illustrator] PLANETA Mochizuki`,
  },
  {
    id: 'BT-0001',
    name: 'Bandai One Piece OP-13 Jp',
    category: 'One Piece',
    stocks: 12,
    cost: '฿600',
    price: '฿800',
    profit: '฿200',
  },
  {
    id: 'BOX-0001',
    name: 'One Piece [OP-13] "Carrying On His Will"',
    category: 'One Piece',
    stocks: 12,
    cost: '฿600',
    price: '฿800',
    profit: '฿200',
  },
  {
    id: 'AC-0001',
    name: '100 Ultra Pro Penny Sleeves',
    category: 'Sleeves',
    stocks: 12,
    cost: '฿600',
    price: '฿800',
    profit: '฿200',
  },
];

export const Seller: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEditProduct = (item: ProductItem) => {
    // เปลี่ยนจาก '/edit-product' เป็น `/edit-product/${item.id}`
    navigate(`/edit-product/${item.id}`, {
      state: {
        product: {
          productId: item.id,
          cardName: item.name,
          cardGame: item.category,
          cardCode: item.cardCode || '',
          set: item.set || '',
          setCode: item.setCode || '',
          productType: item.productType || item.category,
          language: item.language || 'English',
          cost: item.cost.replace('฿', '').replace(',', ''),
          priceOfSell: item.price.replace('฿', '').replace(',', ''),
          stocks: item.stocks.toString(),
          description: item.description || '',
          imageUrl: item.imageUrl,
        },
      },
    });
  };

return (
    // 1. เปลี่ยนเป็น flex แนวนอน เพื่อให้ Sidebar อยู่ซ้ายสุด
    <div className="min-h-screen flex bg-slate-50 font-sans text-gray-800">
      
      {/* 2. วาง Sidebar ไว้ลำดับแรก */}
      <Sidebar currentTab="stocks" />

      {/* 3. สร้างกล่อง Container ฝั่งขวา เพื่อจัดเรียง Header ไว้บน Main */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar (Secondary) - คืนค่าสี bg-[#0f172a] และ text-white ให้เหมือนเดิม */}
        <header className="bg-[#0f172a] text-white flex items-center justify-end px-8 py-3.5 h-16 shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600/50">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Seller Profile"
              className="w-full h-full object-cover"
            />
          </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Title & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stocks Management</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Manage stocks and set selling prices to calculate profit
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsDropdownOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add new product</span>
            </button>
          </div>

          {/* Search / Filter Box */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Product id
                </label>
                <input
                  type="text"
                  placeholder="Product id"
                  className="w-full px-3.5 py-2 text-sm bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Product name
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  className="w-full px-3.5 py-2 text-sm bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Card game
                  </label>
                  <input
                    type="text"
                    placeholder="Card game"
                    className="w-full px-3.5 py-2 text-sm bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <button 
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg border border-transparent transition flex items-center justify-center cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 bg-slate-50/80">
                  <th className="py-3 px-4 font-semibold">Product ID</th>
                  <th className="py-3 px-4 font-semibold text-center">Picture</th>
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold text-center">Stocks</th>
                  <th className="py-3 px-4 font-semibold text-center bg-amber-50/40 text-amber-700">Cost</th>
                  <th className="py-3 px-4 font-semibold text-center bg-blue-50/40 text-blue-700">Price</th>
                  <th className="py-3 px-4 font-semibold text-center bg-emerald-50/40 text-emerald-700">Profit</th>
                  <th className="py-3 px-4 font-semibold text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-semibold text-blue-600">{item.id}</td>
                    
                    <td className="py-4 px-4 text-center">
                      {item.imageUrl ? (
                        <div className="w-10 h-14 rounded mx-auto overflow-hidden border border-gray-200">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-14 bg-gray-200 rounded mx-auto flex items-center justify-center border border-gray-300">
                          <span className="text-[10px] text-gray-400 font-medium">No Img</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-[11px] text-gray-400">{item.category}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-600">
                        {item.stocks} left
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-medium bg-amber-50/20 text-gray-800">
                      {item.cost}
                    </td>

                    <td className="py-4 px-4 text-center font-medium bg-blue-50/20 text-blue-600">
                      {item.price}
                    </td>

                    <td className="py-4 px-4 text-center font-semibold bg-emerald-50/20 text-emerald-600">
                      {item.profit}
                    </td>

                    <td className="py-4 px-4 text-center space-x-3 whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={() => handleEditProduct(item)}
                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        type="button"
                        className="text-red-500 hover:text-red-600 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* เรียกใช้งาน Modal ค้นหาประเภทสินค้า */}
      <AddProductDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      />
    </div>
  );
};

export default Seller;