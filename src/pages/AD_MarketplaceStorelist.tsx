import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Eye } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

const mockProducts = [
  { id: "P-101", name: "Charizard VMAX - Secret Rare", game: "Pokemon TCG", rarity: "Secret Rare", price: 12900, stock: 2, sold: 1, status: "Active" },
  { id: "P-102", name: "Blue-Eyes White Dragon", game: "Yu-Gi-Oh!", rarity: "Ghost Rare", price: 8500, stock: 1, sold: 2, status: "Active" },
  { id: "P-103", name: "Premium Card Sleeves (100pcs)", game: "Accessories", rarity: "-", price: 250, stock: 45, sold: 120, status: "Active" },
];

export const AD_MarketplaceStorelist: React.FC = () => {
  const { storeId } = useParams<{ storeId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ADsidebar currentTab="marketplace-products" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0f172a] text-white flex items-center justify-end px-8 py-3.5 h-16 shrink-0 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600/50">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Admin Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto overflow-y-auto space-y-6">
          <button 
            onClick={() => navigate('/AD_MarketplaceProducts')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stores
          </button>

          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Store Inventory</h1>
              <p className="text-sm text-slate-400 mt-2">
                Viewing products for Store ID: <span className="font-mono text-blue-600 font-bold">{storeId || 'CP01'}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search in store..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-800">Product List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Item ID</th>
                    <th className="py-4 px-6 font-semibold">Product Name</th>
                    <th className="py-4 px-6 font-semibold">Category</th>
                    <th className="py-4 px-6 font-semibold">Rarity</th>
                    <th className="py-4 px-6 text-right font-semibold">Price (฿)</th>
                    <th className="py-4 px-6 text-right font-semibold">Stock</th>
                    <th className="py-4 px-6 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-400 font-mono text-xs">{product.id}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{product.name}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                          {product.game}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{product.rarity}</td>
                      <td className="py-4 px-6 text-right font-bold text-blue-600">{product.price.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => navigate(`/AD_MarketplaceProductsdetail/${product.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AD_MarketplaceStorelist;