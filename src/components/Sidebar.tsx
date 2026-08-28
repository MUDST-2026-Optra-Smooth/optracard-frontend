import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Package, ClipboardList, LayoutDashboard, ArrowLeft } from 'lucide-react';

interface SidebarProps {
  currentTab?: 'stocks' | 'orders' | 'dashboard' | string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  // สไตล์สำหรับปุ่มเมนูตอนที่เลือกอยู่ (Active) และไม่ได้เลือก
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left ${
      isActive
        ? 'bg-blue-600/30 text-white font-semibold border-l-4 border-blue-500'
        : 'text-gray-300 hover:bg-slate-800 hover:text-white font-medium'
    }`;

  return (
    <aside className="w-64 bg-[#182234] text-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)]">
      <div>
        {/* Shop Name / Brand */}
        <div className="px-6 py-5 border-b border-gray-700/60">
          <h2 className="text-xl font-bold tracking-wide text-white">AAA-Trading</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {/* ปุ่ม 1: Stocks Management */}
          <NavLink to="/seller" className={navItemClass}>
            <Package className="w-5 h-5" />
            <span>Stocks Management</span>
          </NavLink>

          {/* ปุ่ม 2: Orders Management */}
          <NavLink to="/orders" className={navItemClass}>
            <ClipboardList className="w-5 h-5" />
            <span>Orders Management</span>
          </NavLink>

          {/* ปุ่ม 3: Dashboard */}
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
        </nav>
      </div>

      {/* Back to Website */}
      <div className="p-4">
        <Link 
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors w-full px-2 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Website</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;