import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Banknote, CreditCard, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

const chartData: MonthlyData[] = [
  { month: 'Feb 2025', revenue: 200, expenses: 240 },
  { month: 'Mar 2025', revenue: 220, expenses: 360 },
  { month: 'Apr 2025', revenue: 450, expenses: 840 },
  { month: 'May 2025', revenue: 1780, expenses: 900 },
  { month: 'Jun 2025', revenue: 420, expenses: 980 },
  { month: 'Jul 2025', revenue: 1360, expenses: 1340 },
  { month: 'Aug 2025', revenue: 2380, expenses: 1800 },
  { month: 'Sep 2025', revenue: 1510, expenses: 760 },
  { month: 'Oct 2025', revenue: 1100, expenses: 1080 },
  { month: 'Nov 2025', revenue: 1450, expenses: 600 },
  { month: 'Dec 2025', revenue: 280, expenses: 0 },
  { month: 'Jan 2026', revenue: 0, expenses: 0 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [viewBy, setViewBy] = useState<'Month' | 'Week'>('Month');
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M' | 'All'>('12M');

  const maxChartValue = 2500;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Sidebar เมนูหลัก */}
      <Sidebar currentTab="dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0e1626] flex items-center justify-end px-8 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600/50">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Seller Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">
                Your summarizes of your stocks and orders in dashboard
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/seller')}
              className="flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Add new card</span>
            </button>
          </div>

          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-[#f59e0b] to-[#f39c12] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Banknote size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Total Revenue
              </span>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">$11502.76</h2>
              <p className="text-xs text-white/80 mt-2">Last 12 months</p>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Total Expenses
              </span>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">$9265.90</h2>
              <p className="text-xs text-white/80 mt-2">All costs</p>
            </div>

            {/* Total Profit */}
            <div className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Total Profit
              </span>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">$2236.86</h2>
              <p className="text-xs text-white/80 mt-2">Revenue - Expenses</p>
            </div>
          </div>

          {/* 5 Small Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">572</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Items Shipped
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">828</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Average Order Value
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">$20.11</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                This Month Orders
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">2</h3>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center col-span-2 md:col-span-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                This Week Orders
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">0</h3>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-600 w-24">View by:</span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewBy('Month')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewBy === 'Month' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewBy('Week')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewBy === 'Week' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-600 w-24">Time Range:</span>
              <div className="flex gap-2">
                {(['3M', '6M', '12M', 'All'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      timeRange === range
                        ? 'border-[#2563eb] text-[#2563eb] bg-blue-50/50'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Monthly Revenue & Expenses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Revenue and expenses comparison over time</p>
              </div>
              <div className="flex items-center gap-6 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#48bb78]" />
                  <span className="text-slate-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-slate-600">Expenses</span>
                </div>
              </div>
            </div>

            {/* Custom SVG/CSS Bar Chart Grid */}
            <div className="relative pt-6 pb-2">
              <div className="flex">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[11px] text-slate-400 pr-4 text-right h-64 shrink-0">
                  <span>$2500</span>
                  <span>$2000</span>
                  <span>$1500</span>
                  <span>$1000</span>
                  <span>$500</span>
                  <span>$0</span>
                </div>

                {/* Bars Plotting Area */}
                <div className="relative flex-1 h-64 border-b border-slate-200">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="w-full" />
                  </div>

                  {/* Columns */}
                  <div className="absolute inset-0 flex items-end justify-between px-2 sm:px-4">
                    {chartData.map((item, idx) => {
                      const revHeight = (item.revenue / maxChartValue) * 100;
                      const expHeight = (item.expenses / maxChartValue) * 100;

                      return (
                        <div key={idx} className="flex items-end gap-1 sm:gap-1.5 h-full group relative">
                          {/* Revenue Bar */}
                          <div
                            style={{ height: `${revHeight}%` }}
                            className="w-2.5 sm:w-4.5 bg-[#48bb78] rounded-t-md transition-all duration-300 hover:brightness-105"
                          />
                          {/* Expense Bar */}
                          <div
                            style={{ height: `${expHeight}%` }}
                            className="w-2.5 sm:w-4.5 bg-[#f97316] rounded-t-md transition-all duration-300 hover:brightness-105"
                          />

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-lg z-20 whitespace-nowrap pointer-events-none">
                            <span className="font-semibold mb-1">{item.month}</span>
                            <span className="text-emerald-400">Revenue: ${item.revenue}</span>
                            <span className="text-orange-400">Expense: ${item.expenses}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between pl-12 pr-2 sm:px-4 mt-3 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {chartData.map((item, idx) => (
                  <span key={idx} className="text-center truncate">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;