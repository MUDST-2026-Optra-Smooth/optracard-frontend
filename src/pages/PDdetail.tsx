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
    </div>
  );
};

export default ProductDetail;