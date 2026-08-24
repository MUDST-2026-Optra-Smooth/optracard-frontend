import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
// ใช้ไอคอนโซเชียลจาก react-icons เพื่อแก้บัค Error
import { FiFacebook, FiInstagram, FiGithub } from 'react-icons/fi';

const ProductDetail: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <header className="bg-[#0f172a] text-white flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 rounded p-1 w-8 h-8 flex items-center justify-center">
            <span className="font-bold text-lg">O</span>
          </div>
          <span className="font-bold text-xl">Optracard</span>
        </div>
        
        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by card game or card name..."
              className="w-full bg-[#1e293b] border border-gray-600 text-sm rounded-md py-2 pl-10 pr-4 focus:outline-none text-white placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <a href="#" className="hover:text-gray-300 hidden sm:block">About Us</a>
          <a href="#" className="hover:text-gray-300 hidden sm:block">Our Team</a>
          <button className="relative">
            <ShoppingCart className="w-5 h-5 text-gray-300 hover:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button className="bg-purple-200 text-purple-600 rounded-full p-1.5 hover:bg-purple-300 transition">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8">
        <button className="flex items-center text-gray-900 font-bold mb-8 hover:text-blue-600 transition">
          <ArrowLeft className="w-5 h-5 mr-2 stroke-[3]" /> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Product Image */}
          <div className="lg:w-1/3 flex justify-center lg:justify-start items-start">
            {/* เรียกใช้รูปภาพจากโฟลเดอร์ public (ต้องมีเครื่องหมาย / ด้านหน้า) */}
            <img
              src="/1111.jpg"
              alt="พี่หน่วง พิธีกรผมสวย"
              className="w-full max-w-md h-auto object-contain rounded-lg shadow-sm drop-shadow-md"
            />
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:w-2/3">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] sm:text-xs font-bold tracking-wide">
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">CARD GAME: BATTLE OF TALINGCHAN</span>
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded">PRODUCT TYPE: Single Card</span>
              <span className="bg-red-50 text-red-500 px-2 py-1 rounded">Rarity: PR</span>
              <span className="ml-auto text-gray-400 font-medium hidden sm:block">Product ID: SG-0010</span>
            </div>

            {/* Title & Store */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
              <h1 className="text-3xl font-bold text-blue-600">พี่หน่วง พิธีกรผมสวย</h1>
              <button className="flex items-center border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition w-fit whitespace-nowrap shadow-sm">
                Sell By: OptraCard Official Store
                <CheckCircle2 className="w-4 h-4 text-blue-500 ml-2 fill-current text-white bg-blue-500 rounded-full" />
                <ChevronRight className="w-4 h-4 ml-1 text-gray-400" />
              </button>
            </div>

            {/* Price Box */}
            <div className="border border-gray-200 rounded-xl p-6 mt-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-gray-400 text-xs font-bold tracking-wider mb-1">PRICE</p>
                  <p className="text-4xl font-bold text-blue-600">฿3,000.00</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 text-sm font-bold flex items-center justify-end">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span> In Stock
                  </p>
                  <p className="text-gray-400 text-xs mt-1 font-medium">Only 2 items left</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg h-12">
                  <button className="px-4 text-gray-400 hover:text-gray-600 text-lg">-</button>
                  <span className="px-4 font-bold text-gray-800">1</span>
                  <button className="px-4 text-gray-400 hover:text-gray-600 text-lg">+</button>
                </div>
                <button className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Card Details Table */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Card Details</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500 w-1/3">Card Game</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">Battle of Talingchan</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500">Card Type</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">Avatar</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500">Rarity</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">PR</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500">Set</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">[BT07] Life of หน่วง</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500">Set Code</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">BT07</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3.5 px-5 text-gray-500">Card Code</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">BT07-023</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 text-gray-500">Language</td>
                      <td className="py-3.5 px-5 font-bold text-gray-800 text-right">Thai</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
              <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                <p>
                  Main effect: [จุติ] : นำ "ยานรายการ เถียงทันหน่วง" จาก Deck หรือ นอก 1 ใบขึ้นมือ หากนำจาก Deck ให้สับ Deck
                </p>
                <p>
                  [เทิร์นละครั้ง] [สั่งใช้] ถ้าใน Construct Zone ฝ่ายเรามี "ยานรายการ เถียงกันหน่วง" ทิ้งการ์ดบนมือ 1 ใบ : เลือก Avatar ฝ่ายตรงข้าม 1 ใบ ที่มี [สามัคคี] , [เตะไซ้] , [ไล่มนุษย์] หรือ [คำสั่งเสีย] นำ Avatar ใบนั้น มาไว้ที่ Magic Zone ฝ่ายเรา
                </p>
                <p>
                  [คำสั่งเสีย] : ฝ่ายตรงข้าม เลือก Avatar ที่อยู่ใน Magic Zone ฝ่ายเรา 1 ใบ กลับขึ้นมือเจ้าของ
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-12 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex flex-col items-center justify-center bg-transparent border border-white rounded p-1 w-10 h-10">
                {/* Minimalist representation of the crest logo */}
                <div className="w-5 h-4 border-b-2 border-l-2 border-r-2 border-white rounded-b-sm"></div>
                <div className="w-1 h-2 bg-white mt-1"></div>
              </div>
              <span className="font-bold text-2xl tracking-wide">Optracard</span>
            </div>
            <p className="text-gray-300 max-w-sm text-sm leading-loose font-medium">
              Empowering Thailand's TCG community<br />
              to push boundaries and reach the next level !
            </p>
          </div>
          <div className="flex space-x-4 items-center">
            {/* Social Icons จาก react-icons */}
            <div className="bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
              <FiFacebook className="w-8 h-8 fill-current text-white border-none" strokeWidth={0} />
            </div>
            <div className="rounded-2xl p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 cursor-pointer hover:opacity-90 transition">
              <div className="bg-[#0f172a] p-2 rounded-xl">
                <FiInstagram className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="cursor-pointer hover:opacity-80 transition">
              <FiGithub className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;