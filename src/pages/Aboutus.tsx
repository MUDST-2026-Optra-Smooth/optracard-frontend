import { Gavel, ShieldCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/Aboutus.jpg';

export const AboutUs = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-slate-950/45 p-4 backdrop-blur-md sm:p-8">
    <div className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-50 text-slate-800 shadow-2xl">
      <section className="bg-gradient-to-r from-[#07173b] via-[#123d91] to-[#2f65ff] px-5 py-6 text-white sm:px-9 sm:py-8"><div className="flex justify-end"><button type="button" onClick={() => navigate(-1)} aria-label="Close About Us" className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"><X className="h-5 w-5" /></button></div><p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">About Optracard</p><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">A better home for Thailand&apos;s TCG community.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Discover cards, trade with other collectors and build a more transparent market together.</p></section>
      <main className="grid gap-6 p-5 sm:grid-cols-[1.05fr_0.95fr] sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Our purpose</p><h2 className="mt-2 text-2xl font-black leading-tight text-slate-900">Collecting should feel exciting, fair and connected.</h2><p className="mt-3 text-sm leading-6 text-slate-600">Optracard brings buying, selling and bidding together in one place, with clearer marketplace information for players and collectors across Thailand.</p><div className="mt-5 flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck className="h-4 w-4" /></div><p className="text-xs leading-5 text-slate-600"><strong className="text-slate-900">Trade with confidence.</strong><br />Clear listings help collectors make informed choices.</p></div><div className="mt-3 flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Gavel className="h-4 w-4" /></div><p className="text-xs leading-5 text-slate-600"><strong className="text-slate-900">Discover rare finds.</strong><br />Special cards and sealed products are closer to the community.</p></div></div><div className="hidden overflow-hidden rounded-2xl bg-slate-100 sm:block"><img src={bannerImg} alt="Optracard community" className="h-full min-h-52 w-full object-cover" /></div></main>
    </div>
  </div>;
};
