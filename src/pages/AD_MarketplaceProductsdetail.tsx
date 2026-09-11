import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, TrendingUp, Package } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

export const AD_MarketplaceProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();

  const product = {
    id: productId || "P-101",
    name: "Charizard ex",
    storeName: "OptraCard Official Store",
    isOfficial: true,
    price: 12900,
    stock: 2,
    sold: 45,
    status: "Live",
    game: "Pokemon TCG",
    type: "Stage 2 Pokémon",
    rarity: "Double Rare",
    set: "Scarlet & Violet—151",
    setCode: "SV3pt5",
    cardCode: "006/165",
    language: "English",
    image: "https://images.pokemontcg.io/sv3pt5/6_hires.png"
  };

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
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store Inventory
          </button>

          <div className="flex flex-col xl:flex-row gap-10 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="xl:w-1/3 flex justify-center items-start">
              <div className="relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-sm h-auto object-contain rounded-2xl shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {product.status}
                </div>
              </div>
            </div>

            <div className="xl:w-2/3">
              <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] sm:text-xs font-bold tracking-wide">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">CARD GAME: {product.game.toUpperCase()}</span>
                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">TYPE: {product.type}</span>
                <span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-md">RARITY: {product.rarity}</span>
                <span className="ml-auto text-slate-400 font-medium font-mono bg-slate-50 px-3 py-1 rounded-md border border-slate-100 hidden sm:block">
                  ID: {product.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
                <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              </div>
              
              <div className="mt-4 flex items-center border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600 w-fit bg-slate-50">
                Seller: <span className="font-bold ml-1 text-slate-800">{product.storeName}</span>
                {product.isOfficial && <CheckCircle2 className="w-4 h-4 text-blue-500 ml-2 fill-current text-white bg-blue-500 rounded-full" />}
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 mt-8 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">LISTING PRICE</p>
                    <p className="text-3xl font-bold text-blue-600">฿{product.price.toLocaleString()}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-6">
                    <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">CURRENT STOCK</p>
                    <p className="text-3xl font-bold text-slate-700 flex items-center gap-2">
                      {product.stock} <Package className="w-5 h-5 text-slate-300" />
                    </p>
                  </div>
                  <div className="border-l border-slate-200 pl-6">
                    <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">TOTAL SOLD</p>
                    <p className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                      {product.sold} <TrendingUp className="w-5 h-5 text-emerald-300" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  Card Specifications
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 w-1/3">Card Game</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.game}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Card Type</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.type}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Rarity</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.rarity}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Set</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.set}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Set Code</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.setCode}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Card Code</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.cardCode}</td>
                      </tr>
                      <tr className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500">Language</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800 text-right">{product.language}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-10 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Card Effect / Description</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-slate-700 text-sm leading-relaxed space-y-4">
                  <p>
                    <strong>Ability: Brave Wing</strong><br/>
                    This Pokémon's attacks do 60 more damage to your opponent's Active Pokémon for each Prize card your opponent has taken.
                  </p>
                  <p>
                    <strong>Attack: Explosive Vortex (330)</strong><br/>
                    Discard 3 Energy from this Pokémon.
                  </p>
                  <p>
                    <strong>Rule:</strong> Pokémon ex rule: When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AD_MarketplaceProductDetail;