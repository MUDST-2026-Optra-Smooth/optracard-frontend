import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import searchIcon from '../assets/search.png';
import avatarIcon from '../assets/Generic avatar.png'; // 1. Import รูปโปรไฟล์เข้ามา

export const Navbar = () => {
  return (
    <nav className="bg-[#0b0f19] text-white py-3 px-6 md:px-10 flex justify-between items-center font-sans border-b border-gray-800">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
        <img src={logoIcon} alt="Optracard Logo" className="w-7 h-7 object-contain" />
        <span>Optracard</span>
      </Link>

      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <img src={searchIcon} alt="Search" className="w-4 h-4 object-contain opacity-50" />
          </div>
          <input
            type="text"
            placeholder="Search by card game or card name..."
            className="w-full bg-[#1a1f2b] text-sm text-gray-200 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#2f65ff]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="hidden lg:flex gap-5 text-gray-300">
          <Link to="/about" className="hover:text-white transition">About Us</Link>
          <Link to="/team" className="hover:text-white transition">Our Team</Link>
        </div>

        <div className="flex items-center gap-5 border-l border-gray-700 pl-5">
          <Link to="/cart" className="relative flex items-center">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              0
            </span>
          </Link>
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 hover:border-[#2f65ff] transition">
            <img src={avatarIcon} alt="Profile" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </nav>
  );
};