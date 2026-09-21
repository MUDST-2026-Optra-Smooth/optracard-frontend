import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Package, ClipboardList, LayoutDashboard, ArrowLeft, ExternalLink, Store } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { loadMyStore } from '../api/seller';
import type { SellerStoreInfo } from '../types/seller';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab?: 'stocks' | 'orders' | 'dashboard' | string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<SellerStoreInfo | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void loadMyStore()
      .then((data) => {
        if (isCurrent && data) setStore(data);
      })
      .catch(() => {
        /* silent fallback if store request fails */
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const storeName = store?.storeName || user?.username || 'My Shop';
  const isApproved = store?.storeStatus === 'APPROVED';

  // สไตล์สำหรับปุ่มเมนูตอนที่เลือกอยู่ (Active) และไม่ได้เลือก
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left ${
      isActive
        ? 'bg-blue-600/30 text-white font-semibold border-l-4 border-blue-500'
        : 'text-gray-300 hover:bg-slate-800 hover:text-white font-medium'
    }`;

  return (
    <>
      <AdminHeader fixed workspaceName={`Seller · ${storeName}`} />
      <aside className="mt-16 w-64 bg-[#182234] text-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] border-r border-slate-800/80">
        <div>
          <div className="px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-blue-400 shrink-0" />
              <h2 className="text-lg font-bold tracking-wide text-white truncate" title={storeName}>
                {storeName}
              </h2>
            </div>
            {store && (
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {store.storeStatus || 'Active'}
                </span>
                {store.storeId && (
                  <Link
                    to="/seller-profile/my"
                    className="text-[11px] text-slate-400 hover:text-blue-300 flex items-center gap-0.5 transition cursor-pointer"
                    title="View your store page on marketplace"
                  >
                    View shop <ExternalLink className="w-3 h-3 inline" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 pb-3 pt-3 space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/seller" className={navItemClass}>
              <Package className="w-5 h-5" />
              <span>Stocks Management</span>
            </NavLink>

            <NavLink to="/orders-management" className={navItemClass}>
              <ClipboardList className="w-5 h-5" />
              <span>Orders Management</span>
            </NavLink>
          </nav>
        </div>

        {/* Back to Website */}
        <div className="p-4 border-t border-slate-800/60">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors w-full px-2 py-2.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
