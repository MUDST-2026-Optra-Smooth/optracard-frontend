import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. นำเข้า useNavigate
import { Search, ChevronDown, Eye } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

interface OrderItem {
  orderId: string;
  customerName: string;
  date: string;
  totalAmount: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const mockOrders: OrderItem[] = [
  {
    orderId: 'ORD-2026-001',
    customerName: 'Somchai Jaidee',
    date: '06 Sep 2026',
    totalAmount: '฿3,800.00',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
  },
  {
    orderId: 'ORD-2026-002',
    customerName: 'John Doe',
    date: '05 Sep 2026',
    totalAmount: '฿800.00',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
  },
  {
    orderId: 'ORD-2026-003',
    customerName: 'Apirak S.',
    date: '04 Sep 2026',
    totalAmount: '฿1,500.00',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
  },
];

export const ADordersManagement: React.FC = () => {
  const navigate = useNavigate(); // 2. เรียกใช้งาน navigate
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-gray-800">
      <ADsidebar currentTab="orders" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0f172a] text-white flex items-center justify-end px-8 py-3.5 h-16 shrink-0">
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

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Monitor and manage all customer orders across the platform
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Order ID, Customer Name..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition">
                  Status: All <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 bg-slate-50/80">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Payment</th>
                  <th className="py-3 px-4 font-semibold text-center">Order Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-semibold text-blue-600">{order.orderId}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="py-4 px-4 text-gray-500">{order.date}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{order.totalAmount}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        order.paymentStatus === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {/* 3. ผูกคำสั่ง onClick ส่ง orderId ไปหน้า ADorderDetail */}
                      <button 
                        type="button"
                        onClick={() => navigate(`/ADorderDetail/${order.orderId}`)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ADordersManagement;