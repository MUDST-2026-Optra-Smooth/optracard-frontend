import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, LayoutDashboard, Store, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminHeader } from './AdminHeader';

interface SPAD_ShellProps {
  children: ReactNode;
}

const mainLinks = [
  { label: 'Overview', to: '/superadmin/overview', icon: LayoutDashboard },
  { label: 'Stores', to: '/superadmin/stores', icon: Store },
  { label: 'Catalog', to: '/superadmin/catalog', icon: BookOpen },
  { label: 'Sales & Transactions', to: '/superadmin/transactions', icon: BarChart3 },
];

const linkClass = (isActive: boolean) =>
  `w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors ${
    isActive
      ? 'border-l-4 border-blue-500 bg-blue-600/30 pl-3 font-semibold text-white'
      : 'border-l-4 border-transparent font-medium text-gray-300 hover:bg-slate-800 hover:text-white'
  }`;

export const SPAD_Shell = ({ children }: SPAD_ShellProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <div className="spad-shell min-h-screen bg-[#f3f7fb] font-sans antialiased text-[#20242b]">
    <AdminHeader />

    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 flex-col bg-[#182234] text-white lg:flex">
        <div className="px-6 py-5">
          <h2 className="whitespace-nowrap text-sm font-bold tracking-wide text-white">OPTRACARD SUPER ADMIN</h2>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {mainLinks.map(({ icon: Icon, ...item }) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink to="/superadmin/users" end className={({ isActive }) => linkClass(isActive)}>
              <UsersRound className="h-5 w-5" strokeWidth={1.8} />
              <span>Manage User</span>
            </NavLink>
            <NavLink to="/superadmin/staff" className={({ isActive }) => linkClass(isActive)}>
              <UsersRound className="h-5 w-5" strokeWidth={1.8} />
              <span>Manage Staff</span>
            </NavLink>
          </div>
        </nav>

        <div className="border-t border-gray-700/60 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f65ff] text-xs font-black">S</div>
            <div>
              <p className="text-sm font-bold">{user?.username ?? 'Super Admin'}</p>
              <button type="button" onClick={handleLogout} className="text-xs text-[#8796b0] hover:text-white">Logout</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  </div>;
};
