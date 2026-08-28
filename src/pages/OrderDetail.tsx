import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Pencil, 
  Printer, 
  MapPin, 
  Truck, 
  ChevronDown 
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface OrderItem {
  id: string;
  name: string;
  code: string;
  set: string;
  setCode: string;
  language: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string;
}

export const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { orderId = 'ORD-00001' } = useParams<{ orderId?: string }>();

  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Paid'>('Unpaid');

  const orderItems: OrderItem[] = [
    {
      id: '1',
      name: 'Charizard ex',
      code: 'SG-0001',
      set: 'Scarlet & Violet 151',
      setCode: 'sv3pt5',
      language: 'English',
      qty: 1,
      unitPrice: 2800,
      subtotal: 2800,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
    },
    {
      id: '2',
      name: 'Blue-Eyes White Dragon',
      code: 'SG-0002',
      set: 'Starter Deck: Kaiba',
      setCode: 'SDK-001',
      language: 'English',
      qty: 1,
      unitPrice: 300,
      subtotal: 300,
      imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Sidebar */}
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
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto space-y-6">
          {/* Back Button & Header Actions */}
          <div>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer transition"
            >
              <ChevronLeft size={16} />
              <span>Back to Orders</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Order #{orderId}
              </h1>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                >
                  <Pencil size={14} />
                  <span>Edit Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2 Cols wide) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Information Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Order Information</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Order ID (PK)</span>
                    <span className="font-bold text-blue-600">ORD-00001</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">User ID</span>
                    <span className="font-semibold text-slate-800">User_01</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                      ⏳ Pending
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Payment Status</span>
                    <div className="inline-block relative">
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as 'Unpaid' | 'Paid')}
                        className="appearance-none font-semibold text-[11px] rounded-md px-2.5 py-0.5 pr-5 cursor-pointer bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] outline-none"
                      >
                        <option value="Unpaid">• Unpaid</option>
                        <option value="Paid">• Paid</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Created At</span>
                    <span className="font-medium text-slate-700">13 Aug 2025, 14:30</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Updated At</span>
                    <span className="font-medium text-slate-700">13 Aug 2025, 14:30</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Payment Method</span>
                    <span className="font-medium text-slate-700">Credit Card</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Shipping Method</span>
                    <span className="font-medium text-slate-700">Standard Shipping</span>
                  </div>
                </div>
              </div>

              {/* Product List Table Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
                <div className="p-6 pb-2">
                  <h2 className="text-sm font-bold text-slate-900">Product List</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        <th className="py-3 px-6 font-semibold">No.</th>
                        <th className="py-3 px-6 font-semibold">Product</th>
                        <th className="py-3 px-6 font-semibold">Details</th>
                        <th className="py-3 px-6 font-semibold text-center">Quantity</th>
                        <th className="py-3 px-6 font-semibold text-right">Unit Price</th>
                        <th className="py-3 px-6 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderItems.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="py-4 px-6 font-bold text-slate-700">{item.id}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 rounded overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{item.name}</div>
                                <div className="text-[11px] text-slate-400">{item.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-[11px]">
                            <ul className="space-y-0.5">
                              <li>• Set: {item.set}</li>
                              <li>• Set Code: {item.setCode}</li>
                              <li>• Language: {item.language}</li>
                            </ul>
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-800">{item.qty}</td>
                          <td className="py-4 px-6 text-right font-medium text-slate-800">฿{item.unitPrice.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right font-bold text-slate-900">฿{item.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50/30">
                        <td colSpan={5} className="py-3 px-6 text-right font-bold text-slate-700">Subtotal (Items)</td>
                        <td className="py-3 px-6 text-right font-bold text-slate-900">฿3,100</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal (Items)</span>
                    <span className="font-semibold text-slate-800">฿3,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping Fee</span>
                    <span className="font-semibold text-slate-800">฿60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold text-red-500">-฿200</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xs font-bold text-slate-900">Total Amount</span>
                  <span className="text-lg font-bold text-blue-600">฿2,960</span>
                </div>
              </div>

            </div>

            {/* Right Column (1 Col wide) */}
            <div className="space-y-6">
              
              {/* Shipping Address Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Shipping Address</h3>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p>123 Mystery Lane</p>
                  <p>Kanto Region</p>
                  <p>Pokémon World 12345</p>
                  <p>Thailand</p>
                </div>
              </div>

              {/* Tracking Information Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={16} className="text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tracking Information</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Tracking Number</span>
                    <span className="text-slate-600 font-medium">-</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Tracking Status</span>
                    <span className="text-slate-600 font-medium">-</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Order Timeline</h3>
                
                <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                  {/* Step 1: Order Placed */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-emerald-600">Order Placed</span>
                        <span className="text-slate-400">13 Aug 2025, 14:30</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Order has been created</p>
                    </div>
                  </div>

                  {/* Step 2: Pending */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-amber-600">Pending</span>
                        <span className="text-slate-400">13 Aug 2025, 14:30</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Waiting for payment confirmation</p>
                    </div>
                  </div>

                  {/* Step 3: Fulfillment */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-slate-400">Fulfillment</span>
                        <span className="text-slate-400">-</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">-</p>
                    </div>
                  </div>

                  {/* Step 4: Shipped */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-slate-400">Shipped</span>
                        <span className="text-slate-400">-</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">-</p>
                    </div>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-slate-400">Delivered</span>
                        <span className="text-slate-400">-</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetail;