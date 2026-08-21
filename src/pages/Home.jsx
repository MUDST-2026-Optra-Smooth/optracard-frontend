import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // ==========================================
  // 🛑 TODO: ส่วนนี้คือจุดที่ต้องดึงข้อมูลจาก Database (Spring Boot)
  // ปกติจะใช้ useEffect และ axios/fetch เพื่อยิง API มาเก็บไว้ใน State
  // ==========================================
  
  // Mock Data: Marketplace (ปรับเหลือ 3 รายการ)
  const marketplaceItems = [
    { id: 1, name: 'Ice Rider Calyrex VMAX', seller: 'Kendo', price: 2500, startingBid: 2100, image: 'https://placehold.co/150x200/png' },
    { id: 2, name: 'Ice Rider Calyrex VMAX', seller: 'First', price: 2500, startingBid: 2100, image: 'https://placehold.co/150x200/png' },
    { id: 3, name: 'Ice Rider Calyrex VMAX', seller: 'Otta', price: 2500, startingBid: 2100, image: 'https://placehold.co/150x200/png' },
  ];

  // Mock Data: Official Store - Singles
  const singleItems = [
    { id: 101, name: 'Pikachu VMAX', price: 1500, stock: 10, image: 'https://placehold.co/150x200/png' },
    { id: 102, name: 'Charizard ex', price: 3200, stock: 5, image: 'https://placehold.co/150x200/png' },
    { id: 103, name: 'Mewtwo VSTAR', price: 1800, stock: 8, image: 'https://placehold.co/150x200/png' },
    { id: 104, name: 'Rayquaza VMAX', price: 2100, stock: 3, image: 'https://placehold.co/150x200/png' },
  ];

  // Mock Data: Official Store - Booster
  const boosterItems = [
    { id: 201, name: 'One Piece OP-04 Pack', price: 150, stock: 50, image: 'https://placehold.co/150x200/png' },
    { id: 202, name: 'Pokemon 151 Booster Pack', price: 200, stock: 15, image: 'https://placehold.co/150x200/png' },
    { id: 203, name: 'Kaldheim Draft Booster', price: 140, stock: 30, image: 'https://placehold.co/150x200/png' },
    { id: 204, name: 'Digimon BT-14 Pack', price: 120, stock: 25, image: 'https://placehold.co/150x200/png' },
  ];

  // Mock Data: Official Store - Booster Box
  const boosterBoxItems = [
    { id: 301, name: 'Pokemon 151 Booster Box', price: 4500, stock: 5, image: 'https://placehold.co/150x200/png' },
    { id: 302, name: 'One Piece OP-04 Box', price: 3800, stock: 8, image: 'https://placehold.co/150x200/png' },
    { id: 303, name: 'VSTAR Universe Box', price: 5200, stock: 2, image: 'https://placehold.co/150x200/png' },
    { id: 304, name: 'Shadowverse Evolve Box', price: 2100, stock: 12, image: 'https://placehold.co/150x200/png' },
  ];

  // Mock Data: Official Store - Accessories
  const accessoriesItems = [
    { id: 401, name: 'Dragon Shield Matte Black', price: 350, stock: 20, image: 'https://placehold.co/150x200/png' },
    { id: 402, name: 'Ultimate Guard Boulder', price: 400, stock: 15, image: 'https://placehold.co/150x200/png' },
    { id: 403, name: 'Pokemon Playmat', price: 850, stock: 10, image: 'https://placehold.co/150x200/png' },
    { id: 404, name: 'Toploader 3x4 (25ct)', price: 100, stock: 100, image: 'https://placehold.co/150x200/png' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. Navbar (ส่วนบนสุด) */}
      <nav className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-blue-600 p-1 rounded">🛡️</div>
          Optracard
        </div>
        
        <div className="flex-1 max-w-3xl mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by card name, set, or character..." 
              className="w-full bg-slate-800 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-blue-400">About Us</Link>
          <Link to="/" className="hover:text-blue-400">Our Team</Link>
          <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
            
            {/* เปลี่ยน Cart ให้ลิ้งก์ไปหน้า Login */}
            <Link to="/login" className="relative hover:opacity-80 transition-opacity">
              <span className="text-xl">🛒</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </Link>
            
            {/* เปลี่ยนรูป Profile ให้ลิ้งก์ไปหน้า Login */}
            <Link to="/login" className="w-8 h-8 bg-slate-500 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"></Link>
            
          </div>
        </div>
      </nav>

      {/* 2. Hero Banner */}
      <div className="w-full bg-yellow-400 h-72 flex items-center justify-center overflow-hidden">
        {/* TODO: ดึงรูปแบนเนอร์โปรโมชั่นจากระบบหลังบ้าน */}
        <h1 className="text-4xl font-extrabold text-red-600 shadow-white drop-shadow-md">
          สนุกกับโปเกมอนการ์ด ตลอดมาและตลอดไป (Banner Placeholder)
        </h1>
      </div>

      {/* 3. Main Content Area (ปรับขยายความกว้างเป็น 95% ของหน้าจอ) */}
      <main className="w-[95%] max-w-[1600px] mx-auto px-4 py-10 space-y-16">
        
        {/* Marketplace Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Marketplace & Trading</h2>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">View all →</button>
          </div>
          {/* ปรับเป็น 3 คอลัมน์ และเพิ่มช่องว่าง */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {marketplaceItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-6 hover:shadow-md transition">
                {/* ขยายรูป Marketplace ให้ใหญ่ขึ้น */}
                <img src={item.image} alt={item.name} className="w-32 h-44 object-cover rounded-lg" />
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Seller: {item.seller}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500">Current</span>
                      <span className="font-bold text-blue-600 text-lg">฿{item.price}</span>
                    </div>
                    {/* เปลี่ยนปุ่ม Add to Cart เป็น Link ไปหน้า Login */}
                    <Link to="/login" className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
                      🛒 Add to Cart
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Official Store Title */}
        <div className="text-center mt-16 mb-10">
          <h2 className="text-3xl font-bold text-blue-700">Optracard Official Store</h2>
        </div>

        {/* --- Single Section --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Single</h3>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">View all →</button>
          </div>
          {/* รองรับหน้าจอใหญ่ขึ้นเป็น 4 คอลัมน์ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {singleItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 group hover:shadow-md transition">
                {/* ขยายพื้นที่รูปให้สูงขึ้นจาก h-48 เป็น h-64 */}
                <div className="bg-slate-200 h-64 p-6 flex justify-center items-center overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-base text-slate-800 truncate">{item.name}</h4>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">฿{item.price}</p>
                      <p className="text-sm text-slate-400 mt-1">Stock: {item.stock} Pieces</p>
                    </div>
                    <Link to="/login" className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors flex items-center justify-center">🛒</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Booster Section --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Booster</h3>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">View all →</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {boosterItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 group hover:shadow-md transition">
                <div className="bg-slate-200 h-64 p-6 flex justify-center items-center overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-base text-slate-800 truncate">{item.name}</h4>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">฿{item.price}</p>
                      <p className="text-sm text-slate-400 mt-1">Stock: {item.stock} Pieces</p>
                    </div>
                    <Link to="/login" className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors flex items-center justify-center">🛒</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Booster Box Section --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Booster Box</h3>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">View all →</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {boosterBoxItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 group hover:shadow-md transition">
                <div className="bg-slate-200 h-64 p-6 flex justify-center items-center overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-base text-slate-800 truncate">{item.name}</h4>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">฿{item.price}</p>
                      <p className="text-sm text-slate-400 mt-1">Stock: {item.stock} Pieces</p>
                    </div>
                    <Link to="/login" className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors flex items-center justify-center">🛒</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Accessories Section --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Accessories</h3>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">View all →</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {accessoriesItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 group hover:shadow-md transition">
                <div className="bg-slate-200 h-64 p-6 flex justify-center items-center overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-base text-slate-800 truncate">{item.name}</h4>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-blue-600 font-bold text-lg">฿{item.price}</p>
                      <p className="text-sm text-slate-400 mt-1">Stock: {item.stock} Pieces</p>
                    </div>
                    <Link to="/login" className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors flex items-center justify-center">🛒</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 4. Footer */}
      <footer className="bg-[#0f172a] text-white py-12 mt-12">
        <div className="max-w-[1600px] w-[95%] mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-2xl mb-2">
              <div className="bg-white text-[#0f172a] p-1.5 rounded">🛡️</div>
              Optracard
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering Thailand's TCG community<br/>to push boundaries and reach the next level !
            </p>
          </div>

          <div className="flex gap-4">
             {/* Facebook Icon */}
             <a href="#" className="w-10 h-10 bg-[#1877F2] hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                 <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
               </svg>
             </a>

             {/* Instagram Icon */}
             <a href="#" className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 hover:opacity-90 rounded-full flex items-center justify-center transition-opacity">
               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                 <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
               </svg>
             </a>

             {/* GitHub Icon */}
             <a href="#" className="w-10 h-10 border border-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center transition-colors">
               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                 <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
               </svg>
             </a>
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default Home;