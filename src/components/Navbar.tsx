import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="bg-[#1a1a2e] text-white py-3 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">O</div>
          Optracard
        </Link>
        
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
          <input 
            type="text" 
            placeholder="Search by card game or card name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a40] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center space-x-6 text-sm">
          <div className="hidden lg:flex space-x-4">
            <Link to="/sell" className="hover:text-blue-400">Start Selling</Link>
            <Link to="/orders" className="hover:text-blue-400">Order history</Link>
            <Link to="/about" className="hover:text-blue-400">About Us</Link>
            <Link to="/team" className="hover:text-blue-400">Our Team</Link>
          </div>
          
          <Link to="/cart" className="relative">
            <span className="text-2xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">1</span>
          </Link>
          
          <Link to="/login" className="w-8 h-8 rounded-full overflow-hidden border border-gray-500">
             <img src="https://via.placeholder.com/32" alt="Profile" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
