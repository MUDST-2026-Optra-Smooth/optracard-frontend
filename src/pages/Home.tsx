import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div>
      <section className="w-full h-64 bg-gray-200 flex items-center justify-center">
        <h2>[Hero Banner Placeholder]</h2>
      </section>

      <section className="max-w-7xl mx-auto py-8">
        <div className="relative flex justify-center items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Marketplace & Trading</h2>
          <Link 
            to="/ViewAllTrading" 
            className="absolute right-0 bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <TradingListingCard cardName="พลทหารหิมะ" gameName="Battle of Talingchan" itemCount={20} startingPrice={298} />
          <TradingListingCard cardName="พลทหารหิมะ" gameName="Battle of Talingchan" itemCount={15} startingPrice={298} />
          <TradingListingCard cardName="พลทหารหิมะ" gameName="Battle of Talingchan" itemCount={12} startingPrice={350} />
          <TradingListingCard cardName="Pikachu VMAX" gameName="Pokemon" itemCount={8} startingPrice={540} />
          <TradingListingCard cardName="Charizard ex" gameName="Pokemon" itemCount={5} startingPrice={890} />
          <TradingListingCard cardName="Dark Magician" gameName="Yu-Gi-Oh!" itemCount={2} startingPrice={980} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-8 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>
        
        {/* หมวดหมู่ Single */}
        <div className="text-left mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Single</h3>
            {/* ส่งค่า type=Single ผ่าน URL */}
             <Link 
              to="/ViewAllOOS?type=Single" 
              className="bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <ProductCard title="พี่หน่วง พิธีกรผมสวย" price={3000} />
            <ProductCard title="Raichu & Alolan Raichu GX" price={9600} />
            <ProductCard title="Charizard ex (SVP) SIR" price={250} />
            <ProductCard title="Monkey D. Luffy" price={720} />
          </div>
        </div>

        {/* หมวดหมู่ Booster */}
        <div className="text-left mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Booster</h3>
            <Link 
              to="/ViewAllOOS?type=Booster" 
              className="bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <ProductCard title="One Piece OP-09 Booster Pack" price={145} />
            <ProductCard title="Pokemon 151 Booster Pack" price={150} />
            <ProductCard title="Lorcana Into the Inklands Pack" price={160} />
            <ProductCard title="Flesh and Blood Booster Pack" price={135} />
          </div>
        </div>

        {/* หมวดหมู่ Booster Box */}
        <div className="text-left mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Booster Box</h3>
            <Link 
              to="/ViewAllOOS?type=Booster%20Box" 
              className="bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <ProductCard title="Pokemon 151 Booster Box" price={4990} />
            <ProductCard title="Yu-Gi-Oh! Duelist Nexus Box" price={2490} />
            <ProductCard title="Weiss Schwarz Trial Deck" price={1290} />
            <ProductCard title="Digimon Card Game Starter Deck" price={690} />
          </div>
        </div>

        {/* หมวดหมู่ Accessories */}
        <div className="text-left mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Accessories</h3>
            <Link 
              to="/ViewAllOOS?type=Accessories" 
              className="bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <ProductCard title="Dragon Shield Matte Sleeves" price={290} />
            <ProductCard title="Magic: The Gathering Playmat" price={850} />
            <ProductCard title="Pokemon 3-Pocket Binder" price={590} />
            <ProductCard title="Top Loader 35 Pack" price={180} />
          </div>
        </div>

      </section>
    </div>
  );
};