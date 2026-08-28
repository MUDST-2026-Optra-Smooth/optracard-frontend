import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  ArrowLeft, 
  ChevronLeft, 
  Pencil 
} from 'lucide-react';

interface ProductData {
  id?: string;
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
  imageUrl?: string;
}

const defaultCardData: ProductData = {
  productId: 'PD-0001',
  cardName: 'Charizard ex',
  cardGame: 'Pokémon',
  cardCode: '006/165',
  set: 'Scarlet & Violet 151',
  setCode: 'sv3pt5',
  productType: 'Pokémon',
  language: 'English',
  cost: '',
  priceOfSell: '',
  stocks: '',
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
  imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
};

const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductData>(defaultCardData);
  const [previewImage, setPreviewImage] = useState<string | null>(defaultCardData.imageUrl || null);

  useEffect(() => {
    if (location.state?.product) {
      setFormData((prev) => ({ ...prev, ...location.state.product }));
      if (location.state.product.imageUrl) {
        setPreviewImage(location.state.product.imageUrl);
      }
    }
  }, [location.state]);

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
    console.log('Updated Product Data:', { ...formData, imageUrl: previewImage });
    // ยิง API อัปเดตข้อมูลสินค้า
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#182132] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-700/40">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-sm">
              O
            </div>
            <span className="font-semibold text-base tracking-wide text-white">Optracard</span>
          </div>

          <div className="px-6 py-5 border-b border-slate-700/40">
            <h2 className="text-lg font-bold tracking-tight text-white">AAA-Trading</h2>
          </div>

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

        {/* Form Container */}
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Back Navigation */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-black mb-3 cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          {/* Heading dynamic ตามชื่อการ์ด */}
          <h1 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
            {formData.cardName || 'Product Details'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-10 items-start">
              {/* Card Image Display & Change */}
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
                  className="w-64 h-88 border-2 border-slate-900 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group bg-slate-100 shadow-sm"
                >
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Card Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Pencil size={24} />
                      <span className="text-xs">Upload image</span>
                    </div>
                  )}

                  {/* Overlay Pencil Icon on Hover */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                      <Pencil size={20} className="text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-5">
                  Items Description
                </h2>

                <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                  {/* Row 1 */}
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

                  {/* Row 2 */}
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

                  {/* Row 3 */}
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
                  <div />

                  {/* Row 4 (Color Highlights) */}
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

            {/* Description Textarea */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                rows={10}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#f1f3f5] border-none rounded-lg p-4 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-y leading-relaxed font-mono"
              />
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
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

export default EditProduct;