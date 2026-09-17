import { useEffect, useState } from 'react';
import logoIcon from '../assets/logo-icon.png';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  fixed?: boolean;
  workspaceName?: string;
}

/** Shared header for the admin and super-admin workspaces. */
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
    <header className={`${fixed ? 'absolute inset-x-0 top-0 z-50' : ''} ${hidden ? '-translate-y-full' : 'translate-y-0'} flex h-16 items-center border-0 bg-[#08152a] px-5 text-white sm:px-8`}>
      <div className="flex items-center gap-2.5">
        <img src={logoIcon} alt="Optracard logo" className="h-8 w-8 object-contain" />
        <span className="text-sm font-bold tracking-wide">Optracard</span>
      </div>
      {headerName && <><span className="mx-4 h-6 w-px bg-slate-600" /><span className="text-sm font-semibold text-slate-200">{headerName}</span></>}
    </header>
  );
};

export default AdminHeader;
