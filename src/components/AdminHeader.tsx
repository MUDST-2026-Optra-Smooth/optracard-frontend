import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';

interface AdminHeaderProps {
  fixed?: boolean;
}

/** Shared header for the admin and super-admin workspaces. */
export const AdminHeader = ({ fixed = false }: AdminHeaderProps) => (
  <header className={`${fixed ? 'fixed inset-x-0 top-0 z-50' : ''} flex h-16 items-center border-0 bg-[#08152a] px-5 text-white sm:px-8`}>
    <Link to="/" className="flex items-center gap-2.5 hover:opacity-85">
      <img src={logoIcon} alt="Optracard logo" className="h-8 w-8 object-contain" />
      <span className="text-sm font-bold tracking-wide">Optracard</span>
    </Link>
  </header>
);

export default AdminHeader;
