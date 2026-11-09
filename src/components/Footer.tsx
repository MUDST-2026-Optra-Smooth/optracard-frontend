import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaGithub, FaInstagram } from 'react-icons/fa';
import logoIcon from '../assets/logo-icon.png';

export const Footer = () => {
  const location = useLocation();
  const modalState = { backgroundLocation: location };
  return (
  <footer className="border-t border-slate-800 bg-[#0b0f19] px-6 py-12 font-sans text-white md:px-10">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:gap-16">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
          <img src={logoIcon} alt="Optracard Logo" className="h-8 w-8 object-contain" />
          Optracard
        </Link>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
          Empowering Thailand&apos;s TCG community to discover, collect and trade with confidence.
        </p>
        <div className="mt-5 flex gap-3">
          <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:-translate-y-1 hover:shadow-lg"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white transition hover:-translate-y-1 hover:shadow-lg"><FaInstagram /></a>
          <a href="https://github.com/MUDST-2026-Optra-Smooth" aria-label="GitHub" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#24292e] text-white transition hover:-translate-y-1 hover:shadow-lg"><FaGithub /></a>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Explore</p>
        <nav className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
          <Link to="/ViewAllOOS" className="transition hover:text-white">Official Store</Link>
          <Link to="/ViewAllTrading" className="transition hover:text-white">Marketplace & Trading</Link>
          <Link to="/auctions" className="transition hover:text-white">Auctions</Link>
        </nav>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Company</p>
        <nav className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
          <Link to="/about" state={modalState} className="transition hover:text-white">About Us</Link>
          <Link to="/team" state={modalState} className="transition hover:text-white">Our Team</Link>
        </nav>
      </div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-5 text-xs text-slate-500">© {new Date().getFullYear()} Optracard. Built for Thailand&apos;s TCG community.</div>
  </footer>
  );
};
