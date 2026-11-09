import { ArrowLeft, Gavel, ShieldCheck, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/Aboutus.jpg';

const values = [
  { icon: ShieldCheck, title: 'Trade with confidence', body: 'Clear marketplace listings and transparent information help collectors make informed choices.' },
  { icon: Gavel, title: 'Discover rare finds', body: 'Auction and marketplace tools bring special cards and sealed products closer to the community.' },
  { icon: Users, title: 'Built for the community', body: 'Optracard is designed around Thailand’s players, collectors and independent sellers.' },
];

export const AboutUs = () => {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <section className="bg-gradient-to-br from-[#07173b] via-[#123d91] to-[#2f65ff] px-5 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back</button><p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-blue-200">About Optracard</p><h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">A better home for Thailand&apos;s TCG community.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">Discover cards, trade with other collectors and build a more transparent market together.</p></div>
    </section>
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Our purpose</p><h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">Collecting should feel exciting, fair and connected.</h2><p className="mt-5 text-base leading-8 text-slate-600">Optracard helps people buy, sell and bid on trading cards in one place. By bringing together real marketplace activity, we aim to give every player and collector clearer information when deciding what to collect next.</p><p className="mt-4 text-base leading-8 text-slate-600">Whether you are looking for your first card, your next sealed product or a rare auction lot, the platform is built to make every step easier to understand.</p></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"><img src={bannerImg} alt="Optracard community" className="aspect-[4/3] w-full object-cover" /></div></div><section className="mt-16"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">What we value</p><h2 className="mt-2 text-3xl font-black text-slate-900">Made for every kind of collector.</h2></div><div className="mt-7 grid gap-5 md:grid-cols-3">{values.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>)}</div></section></main>
  </div>;
};
