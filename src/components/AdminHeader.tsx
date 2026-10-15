import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  fixed?: boolean;
  workspaceName?: string;
}

/** Shared header for the seller, admin, and super-admin workspaces. */
export const AdminHeader = ({ fixed = false, workspaceName }: AdminHeaderProps) => {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const headerName = workspaceName ?? user?.username;

  useEffect(() => {
    if (!fixed) return;

    const handleScroll = (event: Event) => {
      const source = event.target;
      const scrollTop = source instanceof HTMLElement ? source.scrollTop : window.scrollY;
      setHidden(scrollTop > 8);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [fixed]);

  return (
    <header className={`${fixed ? 'absolute inset-x-0 top-0 z-50' : ''} ${hidden ? '-translate-y-full' : 'translate-y-0'} flex h-16 items-center justify-between border-0 bg-[#08152a] px-5 text-white sm:px-8 transition-transform`}>
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition" title="Go to storefront">
          <img src={logoIcon} alt="Optracard logo" className="h-8 w-8 object-contain" />
          <span className="text-sm font-bold tracking-wide">Optracard</span>
        </Link>
        {headerName && (
          <>
            <span className="mx-4 h-6 w-px bg-slate-600" />
            <span className="text-sm font-semibold text-slate-200">{headerName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white transition cursor-pointer"
        >
          Storefront
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
