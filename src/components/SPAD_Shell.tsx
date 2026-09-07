import type { ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BarChart3, BookOpen, LayoutDashboard, ShieldCheck, Store, UsersRound } from 'lucide-react';

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
  const { pathname } = useLocation();
  const managementIsActive = pathname.startsWith('/superadmin/users') || pathname.startsWith('/superadmin/staff');

  return <div className="min-h-screen bg-[#f3f7fb] font-sans text-[#20242b]">
    <header className="flex h-14 items-center justify-between bg-[#08152a] px-5 text-white sm:px-8">
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-85">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2f65ff] text-[10px] font-black">O</div>
        <span className="text-[10px] font-bold tracking-wide">Optracard</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-[8px] text-[#b8c5d8] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#46c792]" /> View-only mode</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2f65ff] text-[9px] font-black">S</div>
      </div>
    </header>

    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="hidden min-h-[calc(100vh-56px)] w-64 shrink-0 flex-col bg-[#182234] text-white lg:flex">
        <div className="border-b border-gray-700/60 px-6 py-5">
          <h2 className="text-xl font-bold tracking-wide text-white">OPTRACARD SUPER ADMIN</h2>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <div className="space-y-1">
            {mainLinks.map(({ icon: Icon, ...item }) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-700/60 pt-4">
            <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400">User &amp; Staff Management</p>
            <div className="space-y-1">
              <NavLink to="/superadmin/users" className={() => linkClass(managementIsActive)}>
                <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
                <span>User &amp; Staff Management</span>
              </NavLink>
              <NavLink to="/superadmin/users" end className={({ isActive }) => linkClass(isActive)}>
                <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                <span>Manage Users</span>
              </NavLink>
              <NavLink to="/superadmin/staff" className={({ isActive }) => linkClass(isActive)}>
                <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                <span>Manage Staff</span>
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-700/60 p-4">
          <Link to="/" className="mb-3 flex w-full items-center gap-3 rounded-lg px-2 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Website</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2f65ff] text-[9px] font-black">S</div>
            <div><p className="text-[9px] font-bold">Super Admin</p><p className="text-[8px] text-[#8796b0]">Monitoring access</p></div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden p-5 sm:p-7">{children}</main>
    </div>
  </div>;
};
