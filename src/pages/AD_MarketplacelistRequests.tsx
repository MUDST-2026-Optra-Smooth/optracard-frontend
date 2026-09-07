import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, CheckCircle2, XCircle, FileText, ChevronRight, Eye, Filter } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

const mockRequests = [
  { id: "MR-1048", productName: "Gear 5 — Awakening", creator: "Kai Wong", storeId: "CP01", category: "Character card", date: "23 Aug 2026", status: "Pending" },
  { id: "MR-1049", productName: "Charizard VMAX (Secret Rare)", creator: "Aria Moon", storeId: "PB02", category: "Pokemon TCG", date: "22 Aug 2026", status: "Pending" },
  { id: "MR-1045", productName: "Premium Deck Box", creator: "Optracard Official", storeId: "OPTRA-01", category: "Accessories", date: "20 Aug 2026", status: "Approved" },
  { id: "MR-1042", productName: "Fake Blue-Eyes White Dragon", creator: "Scammer Shop", storeId: "XX99", category: "Yu-Gi-Oh!", date: "18 Aug 2026", status: "Rejected" },
  { id: "MR-1051", productName: "Pikachu Illustrator (Proxy)", creator: "John Doe", storeId: "JD01", category: "Pokemon TCG", date: "24 Aug 2026", status: "Pending" },
];

export const AD_MarketplaceRequestsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRequests = mockRequests.filter(req => {
    const matchSearch = req.productName.toLowerCase().includes(searchQuery.toLowerCase()) || req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ADsidebar currentTab="marketplace-requests" />

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
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Seller Submissions
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Marketplace Requests</h1>
              <p className="text-sm text-slate-400 mt-2">
                Manage and review all new product listings submitted by sellers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="text-slate-400 text-sm font-medium mb-1">Total Requests</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-slate-800">{mockRequests.length}</div>
              </div>
              <FileText className="absolute top-5 right-5 w-6 h-6 text-slate-100" />
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
              <div className="text-amber-600/70 text-sm font-medium mb-1">Pending Review</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-amber-700">
                  {mockRequests.filter(r => r.status === 'Pending').length}
                </div>
              </div>
              <Clock className="absolute top-5 right-5 w-6 h-6 text-amber-200/50" />
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="text-emerald-600/70 text-sm font-medium mb-1">Approved (Last 7d)</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-emerald-700">
                  {mockRequests.filter(r => r.status === 'Approved').length}
                </div>
              </div>
              <CheckCircle2 className="absolute top-5 right-5 w-6 h-6 text-emerald-200/50" />
            </div>
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="text-red-600/70 text-sm font-medium mb-1">Rejected (Last 7d)</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-red-700">
                  {mockRequests.filter(r => r.status === 'Rejected').length}
                </div>
              </div>
              <XCircle className="absolute top-5 right-5 w-6 h-6 text-red-200/50" />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Product Name or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-600 text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Request ID</th>
                    <th className="py-4 px-6 font-semibold">Product Name</th>
                    <th className="py-4 px-6 font-semibold">Seller / Creator</th>
                    <th className="py-4 px-6 font-semibold">Submitted Date</th>
                    <th className="py-4 px-6 font-semibold text-center">Status</th>
                    <th className="py-4 px-6 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 text-slate-400 font-mono text-xs font-bold">{req.id}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{req.productName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{req.category}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                            {req.creator.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{req.creator}</p>
                            <p className="text-[10px] font-mono text-slate-400">{req.storeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{req.date}</td>
                      
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => navigate(`/AD_MarketplaceRequestDetail/${req.id}`)}
                          className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm cursor-pointer"
                        >
                          {req.status === 'Pending' ? (
                            <>Review <ChevronRight className="w-3 h-3" /></>
                          ) : (
                            <>View <Eye className="w-3 h-3" /></>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                        <p className="text-lg font-bold text-slate-600">No requests found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AD_MarketplaceRequestsList;