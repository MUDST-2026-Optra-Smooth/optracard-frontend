import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminHeader } from './AdminHeader';
import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  Sparkles, 
  ShoppingCart 
} from 'lucide-react';

interface ADsidebarProps {
  currentTab?: string;
}

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
}

export const ADsidebar: React.FC<ADsidebarProps> = ({ currentTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    { 
      id: 'stocks', 
      name: 'Stocks Management', 
      path: '/admin/stocks',
      icon: Package 
    },
    { 
      id: 'orders', 
      name: 'Orders Management', 
      path: '/admin/orders',
      icon: ClipboardList 
    },
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      path: '/admin/dashboard',
      icon: LayoutDashboard 
    },
    { 
      id: 'manage-requests', 
      name: 'Manage Requests', 
      path: '/admin/store-requests',
      icon: Sparkles 
    },
    { 
      id: 'marketplace-products', 
      name: 'Marketplace Products', 
      path: '/admin/marketplace/products',
      icon: ShoppingCart 
    },
    { 
      id: 'marketplace-requests', 
      name: 'Marketplace Requests', 
      path: '/admin/marketplace/requests',
      icon: ShoppingCart 
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AdminHeader fixed />
      <aside className="mt-16 w-64 bg-[#141d2e] text-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] border-r border-slate-800">
        <div>
          <div className="px-6 py-5">
            <h2 className="text-sm font-bold tracking-wider text-gray-100 uppercase">
              OPTRACARD ADMIN
            </h2>
          </div>

          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab
                ? currentTab === item.id
                : location.pathname.toLowerCase() === item.path.toLowerCase();

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 text-left text-sm transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border-blue-500 bg-blue-600/30 pl-3 font-semibold text-white'
                      : 'border-transparent font-medium text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-[#111827]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-base shadow-sm">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-200 truncate">
                {user?.username ?? 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 text-left transition-colors font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ADsidebar;
