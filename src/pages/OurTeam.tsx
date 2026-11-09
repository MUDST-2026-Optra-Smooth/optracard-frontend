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
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-slate-950/45 p-4 backdrop-blur-md sm:p-8"><div className="max-h-full w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-50 text-slate-800 shadow-2xl">
    <section className="bg-[#0b0f19] px-6 py-7 text-white sm:px-9 sm:py-8"><div className="flex items-center justify-between"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back</button><button type="button" onClick={() => navigate(-1)} aria-label="Close Our Team" className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"><X className="h-5 w-5" /></button></div><div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">The people behind Optracard</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Our Team</h1><p className="mt-2 text-sm text-slate-300">Builders and collectors creating a welcoming TCG marketplace.</p></div><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><HeartHandshake className="h-5 w-5" /></div></div></section>
    <main className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">{teamMembers.map((member) => <article key={member.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={member.img} alt={member.name} className="h-full w-full object-cover" /></div><div className="flex items-center justify-between gap-2 px-3 py-2.5"><p className="truncate text-sm font-bold text-slate-900">{member.name}</p><div className="flex gap-1.5"><a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Instagram`} className="text-pink-600 transition hover:scale-110"><FaInstagram className="h-4 w-4" /></a><a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub`} className="text-slate-700 transition hover:scale-110"><FaGithub className="h-4 w-4" /></a></div></div></article>)}</main>
  </div></div>;
};
