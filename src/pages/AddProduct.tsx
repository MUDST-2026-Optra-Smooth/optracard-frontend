import React, { useState, useRef } from 'react';
import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  ArrowLeft, 
  ChevronLeft, 
  Pencil 
} from 'lucide-react';

interface ProductFormData {
  productId: string;
  cardName: string;
  cardGame: string;
  cardCode: string;
  set: string;
  setCode: string;
  productType: string;
  language: string;
  cost: string;
  priceOfSell: string;
  stocks: string;
  description: string;
}

const AddProduct: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    productId: '',
    cardName: '',
    cardGame: '',
    cardCode: '',
    set: '',
    setCode: '',
    productType: '',
    language: '',
    cost: '',
    priceOfSell: '',
    stocks: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ยิง API สำหรับบันทึกรายการสินค้าที่ Seller เพิ่ม
    console.log('Seller Product Submitted:', { ...formData, image: previewImage });
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-800">
      {/* Sidebar เมนูจัดการร้านค้า */}
      <aside className="w-64 bg-[#182132] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-700/40">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-sm">
              O
            </div>
            <span className="font-semibold text-base tracking-wide text-white">Optracard</span>
          </div>

          {/* Shop Name */}
          <div className="px-6 py-5 border-b border-slate-700/40">
            <h2 className="text-lg font-bold tracking-tight text-white">AAA-Trading</h2>
          </div>

          {/* Nav List */}
          <nav className="py-4 space-y-1">
            <button 
              type="button"
              className="w-full flex items-center gap-3 px-6 py-3 bg-[#232f48] text-white font-medium border-l-4 border-blue-500 text-left"
            >
              <Package size={20} className="text-slate-300" />
              <span>Stocks Management</span>
            </button>
            <button 
              type="button"
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-200 hover:bg-[#1d293d] transition-colors text-left"
            >
              <ClipboardList size={20} />
              <span>Orders Management</span>
            </button>
            <button 
              type="button"
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-200 hover:bg-[#1d293d] transition-colors text-left"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-700/40">
          <button 
            type="button"
            className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Website</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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

        {/* Content Form Area */}
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* ปุ่มย้อนกลับไปหน้าเลือกประเภท */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-black mb-3 cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
            Please fill in the information
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-10 items-start">
              {/* อัปโหลดรูปภาพการ์ด */}
              <div className="shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-64 h-84 border-2 border-slate-900 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative group"
                >
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Card Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Pencil size={24} className="text-slate-800 transition-transform group-hover:scale-110" />
                  )}
                </div>
              </div>

              {/* ฟิลด์ข้อมูลสินค้า */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-5">
                  Items Description
                </h2>

                <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                  {/* แถวที่ 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product ID</label>
                    <input
                      type="text"
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Game</label>
                    <input
                      type="text"
                      name="cardGame"
                      value={formData.cardGame}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* แถวที่ 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Code</label>
                    <input
                      type="text"
                      name="cardCode"
                      value={formData.cardCode}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Set</label>
                    <input
                      type="text"
                      name="set"
                      value={formData.set}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Set Code</label>
                    <input
                      type="text"
                      name="setCode"
                      value={formData.setCode}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* แถวที่ 3 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Type</label>
                    <input
                      type="text"
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full bg-[#f1f3f5] border-none rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div /> {/* เว้นช่องว่าง */}

                  {/* แถวที่ 4 ไฮไลต์ตามสีใน UI */}
                  <div>
                    <label className="block text-xs font-semibold text-[#c85a32] mb-1.5">Cost</label>
                    <input
                      type="text"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="w-full bg-[#fef2e8] border-none rounded-lg px-3.5 py-2 text-sm text-[#c85a32] focus:ring-2 focus:ring-orange-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2563eb] mb-1.5">Price of Sell</label>
                    <input
                      type="text"
                      name="priceOfSell"
                      value={formData.priceOfSell}
                      onChange={handleChange}
                      className="w-full bg-[#e8f1fd] border-none rounded-lg px-3.5 py-2 text-sm text-[#2563eb] focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2b9e4a] mb-1.5">Stocks</label>
                    <input
                      type="text"
                      name="stocks"
                      value={formData.stocks}
                      onChange={handleChange}
                      className="w-full bg-[#eaf8ee] border-none rounded-lg px-3.5 py-2 text-sm text-[#2b9e4a] focus:ring-2 focus:ring-emerald-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนรายละเอียด Description */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                rows={7}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#f1f3f5] border-none rounded-lg p-4 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
            </div>

            {/* ปุ่ม ยกเลิก / ยืนยัน */}
            <div className="mt-8 flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="min-w-[120px] py-2 px-6 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="min-w-[120px] py-2 px-6 bg-[#0088ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddProduct;