import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Plus, 
  ChevronRight, 
  FileText, 
  Filter 
} from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

interface StoreRequestItem {
  id: string;
  updatedAt: string;
  storeName: string;
  ownerName: string;
  location: string;
  avatarBg: string;
  submittedDate: string;
  submittedTime: string;
  storeType: string;
  storeChannel: string;
  primaryGames: string[];
  documentsDone: number;
  documentsTotal: number;
  status: 'Pending' | 'In review' | 'Needs info';
}

const mockRequests: StoreRequestItem[] = [
  {
    id: 'REQ-20250819-0018',
    updatedAt: 'Updated 14:10',
    storeName: 'Pokemon Center TH',
    ownerName: 'Narin Kittisak',
    location: 'Bangkok',
    avatarBg: 'bg-orange-500',
    submittedDate: '19 Aug 2025',
    submittedTime: '14:08',
    storeType: 'Professional store',
    storeChannel: 'Online only',
    primaryGames: ['Pokémon', 'One Piece'],
    documentsDone: 4,
    documentsTotal: 4,
    status: 'Pending',
  },
  {
    id: 'REQ-20250819-0016',
    updatedAt: 'Updated 10:24',
    storeName: 'Shuffle House',
    ownerName: 'Thanapong T.',
    location: 'Nonthaburi',
    avatarBg: 'bg-blue-600',
    submittedDate: '19 Aug 2025',
    submittedTime: '10:24',
    storeType: 'Individual seller',
    storeChannel: 'Online only',
    primaryGames: ['Pokémon', 'One Piece'],
    documentsDone: 3,
    documentsTotal: 4,
    status: 'Pending',
  },
  {
    id: 'REQ-20250818-0142',
    updatedAt: 'Updated 16:43',
    storeName: 'Meta TCG',
    ownerName: 'Chaiwat P.',
    location: 'Chiang Mai',
    avatarBg: 'bg-purple-600',
    submittedDate: '18 Aug 2025',
    submittedTime: '16:42',
    storeType: 'Professional store',
    storeChannel: 'Physical + Online',
    primaryGames: ['One Piece', 'Pokémon'],
    documentsDone: 4,
    documentsTotal: 4,
    status: 'In review',
  },
  {
    id: 'REQ-20250818-0131',
    updatedAt: 'Updated 13:07',
    storeName: "Dragon's Shield",
    ownerName: 'Kittisak J.',
    location: 'Bangkok',
    avatarBg: 'bg-emerald-600',
    submittedDate: '18 Aug 2025',
    submittedTime: '13:07',
    storeType: 'Individual seller',
    storeChannel: 'Online only',
    primaryGames: ['Pokémon', 'Dragon Ball'],
    documentsDone: 4,
    documentsTotal: 4,
    status: 'Pending',
  },
  {
    id: 'REQ-20250817-0105',
    updatedAt: 'Updated 09:28',
    storeName: "Collector's Club",
    ownerName: 'Woraseth P.',
    location: 'Pathum Thani',
    avatarBg: 'bg-rose-500',
    submittedDate: '17 Aug 2025',
    submittedTime: '09:28',
    storeType: 'Professional store',
    storeChannel: 'Physical + Online',
    primaryGames: ['MTG', 'Pokémon'],
    documentsDone: 4,
    documentsTotal: 4,
    status: 'Pending',
  },
  {
    id: 'REQ-20250816-0098',
    updatedAt: 'Updated 16:41',
    storeName: 'Card Realm',
    ownerName: 'Piti S.',
    location: 'Nonthaburi',
    avatarBg: 'bg-sky-600',
    submittedDate: '16 Aug 2025',
    submittedTime: '16:41',
    storeType: 'Individual seller',
    storeChannel: 'Online only',
    primaryGames: ['Pokémon', 'MTG'],
    documentsDone: 2,
    documentsTotal: 4,
    status: 'Needs info',
  },
];

export const ADstoreRequest: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'review' | 'needsInfo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [dateFilter, setDateFilter] = useState('All dates');

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ADsidebar currentTab="manage-requests" />

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
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Store Verification Requests
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Review new stores before they become visible on the TCG marketplace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Request workflow</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                <Download size={14} />
                <span>Export request log</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Verification
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">12</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                4 submitted today
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  In Review
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">5</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                2 assigned to you
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Approved This Month
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">38</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                +18.7%
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search request
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Request ID, store name or owner"
                  className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Request status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In review">In review</option>
                  <option value="Needs info">Needs info</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Submitted date
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All dates">All dates</option>
                  <option value="Today">Today</option>
                  <option value="This week">This week</option>
                  <option value="This month">This month</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-100 pt-2 text-xs font-medium text-slate-500">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === 'all'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'hover:text-slate-800'
                }`}
              >
                <span>All requests</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">12</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'hover:text-slate-800'
                }`}
              >
                <span>Pending verification</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">8</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === 'review'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'hover:text-slate-800'
                }`}
              >
                <span>In review</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">3</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('needsInfo')}
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition ${
                  activeTab === 'needsInfo'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'hover:text-slate-800'
                }`}
              >
                <span>Needs information</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">1</span>
              </button>
            </div>
          </div>

          {/* Requests Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                New store request queue - 12 requests
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Open a request to review the store profile and submitted verification documents
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                    <th className="py-3 px-6 font-semibold">Request ID</th>
                    <th className="py-3 px-6 font-semibold">Store / owner</th>
                    <th className="py-3 px-6 font-semibold">Submitted</th>
                    <th className="py-3 px-6 font-semibold">Store type</th>
                    <th className="py-3 px-6 font-semibold">Primary games</th>
                    <th className="py-3 px-6 font-semibold">Documents</th>
                    <th className="py-3 px-6 font-semibold text-center">Status</th>
                    <th className="py-3 px-6 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 align-middle">
                        <div className="font-semibold text-blue-600">{req.id}</div>
                        <div className="text-[11px] text-slate-400">{req.updatedAt}</div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${req.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                            {req.storeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{req.storeName}</div>
                            <div className="text-[11px] text-slate-400">
                              {req.ownerName} · {req.location}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <div className="text-slate-800 font-medium">{req.submittedDate}</div>
                        <div className="text-[11px] text-slate-400">{req.submittedTime}</div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <div className="text-slate-800 font-medium">{req.storeType}</div>
                        <div className="text-[11px] text-slate-400">{req.storeChannel}</div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <div className="text-slate-700 font-medium">
                          {req.primaryGames.join(', ')}
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <div className="font-semibold text-slate-800">
                          {req.documentsDone}/{req.documentsTotal}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {req.documentsDone === req.documentsTotal ? 'Complete' : `${req.documentsTotal - req.documentsDone} missing`}
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle text-center">
                        {req.status === 'Pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                            • Pending
                          </span>
                        )}
                        {req.status === 'In review' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                            • In review
                          </span>
                        )}
                        {req.status === 'Needs info' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                            • Needs info
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/ADstoreRequestdetail`)}
                          className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          View detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1-6 of 12 requests</span>
              <div className="flex items-center gap-1.5">
                <button type="button" className="w-7 h-7 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center">
                  1
                </button>
                <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                  2
                </button>
                <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                  ›
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ADstoreRequest;