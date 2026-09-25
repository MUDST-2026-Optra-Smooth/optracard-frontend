import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCartCount } from '../hooks/useCartCount';
import { loadCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';
import logoIcon from '../assets/logo-icon.png';
import searchIcon from '../assets/search.png';
import avatarIcon from '../assets/Generic avatar.png';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const [searchParams] = useSearchParams();
  const [catalogItems, setCatalogItems] = useState<CatalogProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cartCount = useCartCount();
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const dashboardPath = user?.role === 'SUPER_ADMIN' ? '/superadmin/overview' : '/admin/dashboard';
  const shopPath = user?.role === 'SELLER' ? '/dashboard' : '/start-selling';

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

      <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-xl mx-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative w-full"
        >
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border-0 bg-transparent p-0"
            aria-label="Search"
          >
            <img src={searchIcon} alt="Search" className="w-4 h-4 object-contain opacity-50 hover:opacity-80" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search by card game or card name..."
            className="w-full bg-[#1a1f2b] text-sm text-gray-200 rounded-md pl-10 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-[#2f65ff]"
            onFocus={() => {
              if (!catalogItems.length) {
                void loadCatalog().then(setCatalogItems).catch(() => {});
              }
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

          {showDropdown && trimmedQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#121722] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 text-left">
              {matchingCategories.length > 0 && (
                <div className="p-2 border-b border-gray-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">Categories</p>
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
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
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(`/product/${p.id}`);
                      }}
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
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearch()}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium cursor-pointer transition-colors"
                >
                  View all search results for "{query}" →
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {isAdminUser ? (
        <div className="flex items-center gap-5 text-sm font-medium">
          <div className="hidden lg:flex gap-5 text-gray-300 items-center">
            <Link to="/order-history" className="hover:text-white transition">Order history</Link>
            <Link to="/about" className="hover:text-white transition">About Us</Link>
            <Link to="/team" className="hover:text-white transition">Our Team</Link>
          </div>
          <Link to={dashboardPath} className="text-gray-300 transition hover:text-white">Back to Dashboard</Link>
          <Link to="/cart" aria-label="Shopping Cart" className="relative flex items-center justify-center w-10 h-10 bg-[#1a1f2b] rounded-full hover:bg-gray-800 transition cursor-pointer">
            <span className="text-lg">🛒</span>
            <span className="absolute -top-1 -right-1 bg-[#ff4757] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </Link>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-300 hover:text-white cursor-pointer">
            Logout
          </button>
        </div>
      ) : (

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
              <button type="button" onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-300 hover:text-white cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-[#2f65ff] px-3 py-2 text-xs hover:bg-blue-700 cursor-pointer">
              Login
            </Link>
          )}
        </div>
      </div>
      )}
    </nav>
  );
};
