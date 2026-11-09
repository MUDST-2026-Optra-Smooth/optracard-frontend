import { ArrowLeft, HeartHandshake, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import raffyImg from '../assets/raffy.jpg';
import thosapornImg from '../assets/kendo.jpg';
import phutthisanImg from '../assets/phutthisan.jpg';
import pannatatImg from '../assets/Ming.jpg';
import purinutImg from '../assets/optra.png';
import nantananImg from '../assets/ice.jpg';
import saksitImg from '../assets/Boom.jpg';

const teamMembers = [
  { name: 'Raffy', img: raffyImg, github: 'https://github.com/Raffylnwza007', instagram: 'https://www.instagram.com/raffynoiz/' },
  { name: 'Thosaporn', img: thosapornImg, github: 'https://github.com/oKENDOo', instagram: 'https://www.instagram.com/k.e.n_d.o/' },
  { name: 'Phutthisan', img: phutthisanImg, github: 'https://github.com/Phutthi-1st', instagram: 'https://www.instagram.com/phutthiq_fi/' },
  { name: 'Pannatat', img: pannatatImg, github: 'https://github.com/Pannatat-Pip', instagram: 'https://www.instagram.com/ming_pntp/' },
  { name: 'Purinut', img: purinutImg, github: 'https://github.com/purinut123', instagram: 'https://www.instagram.com/puripop_/' },
  { name: 'Nantanan', img: nantananImg, github: 'https://github.com/fourthapril', instagram: 'https://www.instagram.com/moonly_np/' },
  { name: 'Saksit', img: saksitImg, github: 'https://github.com/Saksit-Jittasopee', instagram: 'https://www.instagram.com/saksitjittasopee/' },
];

export const OurTeam = () => {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, []);
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-md sm:p-8"><div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-50 text-slate-800 shadow-2xl">
    <section className="bg-[#0b0f19] px-5 py-14 text-white sm:py-20"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back</button><button type="button" onClick={() => navigate(-1)} aria-label="Close Our Team" className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"><X className="h-5 w-5" /></button></div><div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">The people behind Optracard</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Our Team</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-300">A group of builders and collectors creating a more welcoming TCG marketplace.</p></div><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white"><HeartHandshake className="h-7 w-7" /></div></div></div></section>
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{teamMembers.map((member) => <article key={member.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={member.img} alt={member.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="flex items-center justify-between gap-3 p-4"><div><h2 className="font-bold text-slate-900">{member.name}</h2><p className="mt-1 text-xs text-slate-500">Optracard Team</p></div><div className="flex gap-2"><a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Instagram`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white transition hover:scale-105"><FaInstagram className="h-4 w-4" /></a><a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:scale-105 hover:bg-slate-50"><FaGithub className="h-4 w-4" /></a></div></div></article>)}</div></main>
  </div></div>;
};
