import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface OrderItemDetail {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItemDetail[];
  total: number;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
}

const initialOrders: Order[] = [
  {
    id: 'ORD-00001',
    userId: 'User_01',
    items: [
      { name: 'Charizard ex', qty: 1 },
      { name: 'Monkey D. Luffy', qty: 2 },
    ],
    total: 3100,
    status: 'Pending',
  },
  {
    id: 'ORD-00002',
    userId: 'CardMaster99',
    items: [
      { name: 'One Piece OP-13 jp', qty: 1 },
    ],
    total: 300,
    status: 'Fulfilled',
  },
];

export const OrdersManagement: React.FC = () => {
  const navigate = useNavigate();

  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusChange = (orderId: string, newStatus: 'Pending' | 'Fulfilled' | 'Cancelled') => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchOrder = order.id.toLowerCase().includes(orderIdFilter.trim().toLowerCase());
    const matchUser = order.userId.toLowerCase().includes(userIdFilter.trim().toLowerCase());
    const matchStatus = statusFilter === '' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchOrder && matchUser && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-800">
      {/* ใช้ Component Sidebar กลางร่วมกัน */}
      <Sidebar currentTab="orders" />

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

        {/* Content View */}
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Header Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Orders Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Update customer order status
            </p>
          </div>

          {/* Search / Filter Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Order ID */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Order ID</label>
                <input
                  type="text"
                  placeholder="Order ID"
                  value={orderIdFilter}
                  onChange={(e) => setOrderIdFilter(e.target.value)}
                  className="w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-slate-400"
                />
              </div>

              {/* User ID */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">User ID</label>
                <input
                  type="text"
                  placeholder="User ID"
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-slate-400"
                />
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#f1f3f5] border-none rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Fulfilled">Fulfilled</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Search Icon Button */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  className="w-full md:w-11 h-10 bg-[#f1f3f5] hover:bg-[#e4e7eb] rounded-xl flex items-center justify-center text-slate-700 transition cursor-pointer"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 bg-slate-50/50">
                  <th className="py-3.5 px-6 font-semibold">Order ID</th>
                  <th className="py-3.5 px-6 font-semibold">User ID</th>
                  <th className="py-3.5 px-6 font-semibold">Items</th>
                  <th className="py-3.5 px-6 font-semibold">Total</th>
                  <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-5 px-6 font-semibold text-blue-600 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-5 px-6 text-slate-800 font-medium whitespace-nowrap">
                        {order.userId}
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-slate-700">
                              • {item.name}{' '}
                              <span className="text-slate-400 font-normal">
                                (x{item.qty})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-5 px-6 font-bold text-slate-900 whitespace-nowrap">
                        ฿{order.total.toLocaleString()}
                      </td>
                      <td className="py-5 px-6 text-center whitespace-nowrap">
                        <div className="inline-block relative">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as 'Pending' | 'Fulfilled' | 'Cancelled'
                              )
                            }
                            className={`appearance-none font-semibold text-xs rounded-lg px-3 py-1.5 pr-6 cursor-pointer border outline-none transition ${
                              order.status === 'Pending'
                                ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                                : 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                            }`}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Fulfilled">✓ Fulfilled</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                              order.status === 'Pending' ? 'text-[#b45309]' : 'text-[#15803d]'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="text-slate-700 hover:text-blue-600 transition cursor-pointer p-1"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrdersManagement;