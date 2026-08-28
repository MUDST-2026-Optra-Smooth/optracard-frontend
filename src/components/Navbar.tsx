import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logoIcon from '../assets/logo-icon.png';
import searchIcon from '../assets/search.png';
import avatarIcon from '../assets/Generic avatar.png';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by card game or card name..."
            className="w-full bg-[#1a1f2b] text-sm text-gray-200 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#2f65ff]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="hidden lg:flex gap-5 text-gray-300 items-center">
          <Link to="/start-selling" className="hover:text-white transition">Start Selling</Link>
          <Link to="/order-history" className="hover:text-white transition">Order history</Link>
          <Link to="/about" className="hover:text-white transition">About Us</Link>
          <Link to="/team" className="hover:text-white transition">Our Team</Link>
        </div>

        <div className="flex items-center gap-5 pl-2">
          <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 bg-[#1a1f2b] rounded-full hover:bg-gray-800 transition cursor-pointer">
            <span className="text-lg">🛒</span>
            <span className="absolute -top-1 -right-1 bg-[#ff4757] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              3
            </span>
          </Link>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#2f65ff] transition cursor-pointer bg-gray-300">
            <img src={avatarIcon} alt="Profile" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </nav>
  );
};