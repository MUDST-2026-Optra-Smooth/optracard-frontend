import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';
import logoIcon from '../assets/logo-icon.png';
import searchIcon from '../assets/search.png';
import avatarIcon from '../assets/Generic avatar.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const [catalogItems, setCatalogItems] = useState<CatalogProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const dashboardPath = user?.role === 'SUPER_ADMIN' ? '/superadmin/overview' : '/admin/dashboard';

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    let isCurrent = true;
    void loadCatalog()
      .then((items) => {
        if (isCurrent) setCatalogItems(items);
      })
      .catch(() => {
        /* silent catalog preload */
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadCount = async () => {
      if (!user) { setCartCount(0); return; }
      const token = localStorage.getItem('token');
      if (!token) return;
      let userId = user.userId;
      try {
        if (!userId) {
          const profile = await fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
          if (!profile.ok) return;
          userId = (await profile.json()).userId;
        }
        if (!userId) return;
        const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) setCartCount(Number((await response.json()).totalItemCount ?? 0));
      } catch { /* count is non-critical to navigation */ }
    };
    void loadCount();
    const refresh = () => { void loadCount(); };
    window.addEventListener('cart-updated', refresh);
    return () => window.removeEventListener('cart-updated', refresh);
  }, [user]);

  const handleProtectedNavigation = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault();
      navigate('/login', { state: { from: path } });
    }
  };

  const handleSearch = (targetQuery?: string) => {
    const term = (targetQuery ?? query).trim();
    setShowDropdown(false);
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategoryClick = (category: string) => {
    setShowDropdown(false);
    const officialTypes = ['Single', 'Booster', 'Booster Box', 'Accessories'];
    const matched = officialTypes.find((t) => t.toLowerCase() === category.toLowerCase());
    if (matched) {
      navigate(`/ViewAllOOS?type=${encodeURIComponent(matched)}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(category)}`);
    }
  };

  const trimmedQuery = query.trim().toLowerCase();

  const matchingCategories = useMemo(() => {
    if (!trimmedQuery) return [];
    const categories = ['Single', 'Booster', 'Booster Box', 'Accessories'];
    return categories.filter((c) => c.toLowerCase().includes(trimmedQuery));
  }, [trimmedQuery]);

  const matchingProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    return catalogItems
      .filter((p) =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.game.toLowerCase().includes(trimmedQuery) ||
        p.type.toLowerCase().includes(trimmedQuery)
      )
      .slice(0, 5);
  }, [catalogItems, trimmedQuery]);

  return (
    <nav className="bg-[#0b0f19] text-white py-3 px-6 md:px-10 flex justify-between items-center font-sans border-b border-gray-800 relative z-40">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
        <img src={logoIcon} alt="Optracard Logo" className="w-7 h-7 object-contain" />
        <span>Optracard</span>
      </Link>

      <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative w-full"
        >
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded text-gray-400 hover:text-white transition cursor-pointer"
          >
            <img src={searchIcon} alt="Search" className="w-4 h-4 object-contain opacity-60 hover:opacity-100" />
          </button>
  const shopPath = user?.role === 'SELLER' ? '/dashboard' : '/start-selling';

  return (
    <nav className="bg-[#0b0f19] text-white py-3 px-6 md:px-10 flex justify-between items-center font-sans border-b border-gray-800">
      {isAdminUser ? (
        <div className="flex items-center gap-2 text-xl font-bold tracking-wide">
          <img src={logoIcon} alt="Optracard Logo" className="w-7 h-7 object-contain" />
          <span>Optracard</span>
        </div>
      ) : (
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
          <img src={logoIcon} alt="Optracard Logo" className="w-7 h-7 object-contain" />
          <span>Optracard</span>
        </Link>
      )}

      {isAdminUser ? (
        <>
        <div className="hidden flex-1 md:flex md:max-w-xl md:mx-8">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center pointer-events-none">
              <img src={searchIcon} alt="Search" className="h-4 w-4 object-contain opacity-50" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="Search by card game or card name..."
              className="w-full rounded-md bg-[#1a1f2b] py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2f65ff]"
            />
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to={dashboardPath} className="text-gray-300 transition hover:text-white">Back to Dashboard</Link>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-300 hover:text-white">Logout</button>
        </div>
        </>
      ) : (
        <>
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <img src={searchIcon} alt="Search" className="w-4 h-4 object-contain opacity-50" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by card game or card name..."
            className="w-full bg-[#1a1f2b] text-sm text-gray-200 rounded-md pl-10 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-[#2f65ff]"
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
          />
        
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>

        {showDropdown && trimmedQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#121722] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 text-left">
            {matchingCategories.length > 0 && (
              <div className="p-2 border-b border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">Categories</p>
                {matchingCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="group w-full text-left px-3 py-2 rounded-md text-xs text-blue-400 hover:bg-[#1f293d] hover:text-blue-300 flex items-center justify-between transition-all duration-150 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="text-sm transition-transform duration-150 group-hover:scale-110">📁</span>
                      <span>{cat}</span>
                    </span>
                    <span className="text-[11px] text-gray-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all">
                      View all {cat} →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchingProducts.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">Products</p>
                {matchingProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSearch(p.name)}
                    className="group w-full text-left px-3 py-2 rounded-md text-xs text-gray-200 hover:bg-[#1f293d] hover:text-white flex items-center gap-3 transition-all duration-150 cursor-pointer"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover shrink-0 bg-gray-800 transition-transform duration-150 group-hover:scale-110 border border-transparent group-hover:border-blue-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs shrink-0 transition-transform duration-150 group-hover:scale-110">🃏</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{p.game} • {p.type}</p>
                    </div>
                    <span className="font-bold text-blue-400 shrink-0">฿{p.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}

            {matchingCategories.length === 0 && matchingProducts.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">
                Press Enter to search for "{query}"
              </div>
            )}

            <div className="bg-[#0b0f19] p-2 border-t border-gray-800 text-center">
              <button
                type="button"
                onClick={() => handleSearch()}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium cursor-pointer transition-colors"
              >
                View all search results for "{query}" →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="hidden lg:flex gap-5 text-gray-300 items-center">
          <Link to={shopPath} onClick={handleProtectedNavigation(shopPath)} className="hover:text-white transition">My Shop</Link>
          <Link to="/order-history" onClick={handleProtectedNavigation('/order-history')} className="hover:text-white transition">Order history</Link>
          <Link to="/about" className="hover:text-white transition">About Us</Link>
          <Link to="/team" className="hover:text-white transition">Our Team</Link>
        </div>

        <div className="flex items-center gap-5 pl-2">
          <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 bg-[#1a1f2b] rounded-full hover:bg-gray-800 transition cursor-pointer">
            <span className="text-lg">🛒</span>
            <span className="absolute -top-1 -right-1 bg-[#ff4757] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </Link>
          {user ? (
            <>
              <Link to="/profile" aria-label="Profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#2f65ff] transition cursor-pointer bg-gray-300">
                <img src={avatarIcon} alt="Profile" className="w-full h-full object-cover" />
              </Link>
              <button type="button" onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-300 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-[#2f65ff] px-3 py-2 text-xs hover:bg-blue-700">Login</Link>
          )}
        </div>
      </div>
        </>
      )}
    </nav>
  );
};