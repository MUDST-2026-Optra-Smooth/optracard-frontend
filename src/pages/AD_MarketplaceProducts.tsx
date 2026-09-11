import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, MoreHorizontal, Store, Users, TrendingUp, Package, ShieldCheck } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

const storesData = [
  {
    id: 2,
    name: "Gear 5 - Awakening Shop",
    owner: "Kai Wong",
    storeId: "CP01",
    productsCount: "1,250",
    category: "Character",
    badge: "Featured",
    badgeDot: "bg-cyan-400",
    bgGradient: "from-slate-800 to-indigo-900",
    logoTheme: "bg-indigo-900/50 border-indigo-400/30",
    isOfficial: false,
    status: "Active"
  },
  {
    id: 3,
    name: "Mystic Guardian Store",
    owner: "Aria Moon",
    storeId: "PB02",
    productsCount: "920",
    category: "Alt art",
    badge: "Popular",
    badgeDot: "bg-purple-400",
    bgGradient: "from-indigo-900 to-purple-900",
    logoTheme: "bg-purple-900/50 border-purple-400/30",
    isOfficial: false,
    status: "Suspended"
  },
  {
    id: 4,
    name: "Verdant Tactician",
    owner: "Jules Lee",
    storeId: "ST04",
    productsCount: "640",
    category: "Character",
    badge: "New",
    badgeDot: "bg-emerald-400",
    bgGradient: "from-teal-900 to-emerald-900",
    logoTheme: "bg-emerald-900/50 border-emerald-400/30",
    isOfficial: false,
    status: "Active"
  },
  {
    id: 5,
    name: "Ember Crown - 1st Ed",
    owner: "Rin Matsuoka",
    storeId: "OP02",
    productsCount: "2,100",
    category: "Rare card",
    badge: "Top rated",
    badgeDot: "bg-amber-400",
    bgGradient: "from-red-900 to-orange-900",
    logoTheme: "bg-orange-900/50 border-orange-400/30",
    isOfficial: false,
    status: "Active"
  }
];

export const AD_MarketplaceProducts: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');

  const filteredAndSortedStores = storesData
    .filter(store => store.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(store => {
      if (statusFilter === 'All') return true;
      return store.status === statusFilter;
    })
    .filter(store => {
      if (categoryFilter === 'All') return true;
      if (categoryFilter === 'Official') return store.isOfficial;
      if (categoryFilter === 'Community') return !store.isOfficial;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Most Products') {
        const countA = parseInt(a.productsCount.replace(/,/g, ''));
        const countB = parseInt(b.productsCount.replace(/,/g, ''));
        return countB - countA;
      }
      if (sortBy === 'Alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return a.id - b.id; 
    });

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
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Marketplace Catalog
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
              <p className="text-sm text-slate-400 mt-2">
                Browse every approved store currently active in the community marketplace.
              </p>
            </div>
            
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <Download className="w-4 h-4" />
              Export catalog
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="text-slate-400 text-sm font-medium mb-1">Total Stores</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-slate-800">{filteredAndSortedStores.length}</div>
                <div className="text-emerald-500 text-xs font-bold mb-1 flex items-center">↑ 8.4%</div>
              </div>
              <Store className="absolute top-5 right-5 w-6 h-6 text-slate-100" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="text-slate-400 text-sm font-medium mb-1">Active Creators</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-slate-800">214</div>
                <div className="text-emerald-500 text-xs font-bold mb-1 flex items-center">↑ 5.1%</div>
              </div>
              <Users className="absolute top-5 right-5 w-6 h-6 text-slate-100" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="text-slate-400 text-sm font-medium mb-1">Items Sold This Month</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-slate-800">386</div>
                <div className="text-emerald-500 text-xs font-bold mb-1 flex items-center">↑ 12.2%</div>
              </div>
              <TrendingUp className="absolute top-5 right-5 w-6 h-6 text-slate-100" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="text-slate-400 text-sm font-medium mb-1">Avg. Inventory Size</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-slate-800">780</div>
                <div className="text-slate-400 text-xs font-medium mb-1 flex items-center">Items/Store</div>
              </div>
              <Package className="absolute top-5 right-5 w-6 h-6 text-slate-100" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search marketplace stores..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-600 text-sm rounded-full px-4 py-2.5 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active / Live</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-600 text-sm rounded-full px-4 py-2.5 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Official">Official Stores</option>
                <option value="Community">Community Stores</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 font-semibold text-sm rounded-full px-4 py-2.5 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="Latest">Sort by: Latest</option>
                <option value="Most Products">Most Products</option>
                <option value="Alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedStores.map((store) => (
              <div 
                key={store.id} 
                onClick={() => navigate(`/AD_MarketplaceStorelist/${store.id}`)}
                className="bg-white rounded-[24px] p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className={`relative w-full h-48 rounded-[20px] bg-gradient-to-br ${store.bgGradient} overflow-hidden mb-4 flex items-center justify-center`}>
                  <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${store.badgeDot}`}></span>
                    {store.badge}
                  </div>
                  <div className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                  
                  <div className={`w-20 h-28 rounded-xl border ${store.logoTheme} backdrop-blur-sm flex flex-col items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform duration-300`}>
                    <div className="w-6 h-6 border-2 border-white/40 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white/60 rounded-sm transform rotate-45"></div>
                    </div>
                    <div className="text-white/80 text-[8px] font-bold tracking-widest uppercase text-center px-2">
                      {store.name.split(' ')[0]}<br/>{store.isOfficial ? 'Official' : 'Store'}
                    </div>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">{store.name}</h3>
                      {store.isOfficial && <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                    </div>
                    
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      store.status === 'Active' ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${store.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {store.status === 'Active' ? 'Live' : 'Suspended'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${store.isOfficial ? 'bg-blue-100 text-blue-700' : 'bg-orange-200 text-orange-700'}`}>
                      {store.owner.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">{store.owner}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] font-mono text-slate-400">{store.storeId}</span>
                  </div>

                  <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-0.5">Total Inventory</div>
                      <div className="text-base font-bold text-slate-800">{store.productsCount} <span className="text-[10px] font-normal text-slate-400 ml-0.5">Items</span></div>
                    </div>
                    <div className={`text-[10px] font-bold tracking-wide uppercase ${store.isOfficial ? 'text-blue-500' : 'text-slate-400'}`}>
                      {store.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AD_MarketplaceProducts;