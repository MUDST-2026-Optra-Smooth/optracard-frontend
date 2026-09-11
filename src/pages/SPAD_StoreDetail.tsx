import { Link, useParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { SPAD_ExportButton, SPAD_Panel, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const inventory = [
  { name: 'Charizard ex · 223/197', code: 'SV03-223/197', game: 'Pokémon', set: 'Scarlet & Violet · 151', stock: '12', price: '฿2,800', sold: '8', color: 'bg-[#f08a35]' },
  { name: 'Blue-Eyes White Dragon', code: 'QCCP-EN001', game: 'Yu-Gi-Oh!', set: 'Quarter Century', stock: '8', price: '฿1,450', sold: '6', color: 'bg-[#4e79d9]' },
  { name: 'Pikachu VMAX · Rainbow', code: 'SWSH-188', game: 'Pokémon', set: 'Vivid Voltage', stock: '24', price: '฿980', sold: '14', color: 'bg-[#38a679]' },
  { name: 'Monkey D. Luffy · SEC', code: 'OP05-119', game: 'One Piece', set: 'Romance Dawn', stock: '3', price: '฿3,200', sold: '3', color: 'bg-[#805cc3]' },
];

export function SPAD_StoreDetail() {
  const { storeId } = useParams();
  const storeName = storeId === 'card-realm' ? 'Card Realm' : storeId === 'meta-tcg' ? 'Meta TCG' : 'Pokemon Center TH';

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <Link to="/superadmin/stores" className="inline-flex text-[8px] font-bold text-[#2f65ff] hover:text-[#1647c4]">← Back to stores</Link>

        <div className="rounded-lg border border-[#e1e6ee] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(27,39,63,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f59b32] text-[10px] font-black text-white">PC</div><div><h1 className="text-sm font-black text-[#263142]">{storeName}</h1><p className="text-[8px] text-[#a1a8b3]">ST-000124 · Bangkok, Thailand · Storefront active since 12 Jan 2025</p><div className="mt-1 flex gap-1.5"><SPAD_StatusBadge label="Active" tone="green" /><SPAD_StatusBadge label="Public data only" tone="blue" /></div></div></div>
            <div className="flex items-center gap-3 sm:text-right"><p className="hidden text-[8px] text-[#a1a8b3] sm:block">Last activity: Today, 14:12</p><SPAD_ExportButton label="Export snapshot" fileName={`${storeId ?? 'store'}-snapshot.csv`} rows={inventory.map((item) => ({ Product: item.name, Code: item.code, Game: item.game, Stock: item.stock, Price: item.price, 'Sold · 30d': item.sold }))} /></div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SPAD_StatCard label="Products listed" value="2,842" detail="+184 this month" /><SPAD_StatCard label="In-stock products" value="2,418" detail="85.1% of catalog" tone="teal" /><SPAD_StatCard label="GMV · 30 days" value="฿1.21M" detail="+22.0% vs previous" tone="orange" /><SPAD_StatCard label="Orders · 30 days" value="184" detail="Average ฿6,582 / order" tone="purple" /></div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)]">
          <SPAD_Panel title="Public inventory" subtitle="Products currently listed by this store · View-only" action={<Link to="/superadmin/catalog" className="text-[8px] font-bold text-[#2f65ff]">Open catalog →</Link>}>
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">Product</th><th className="px-3 py-2.5">Game / set</th><th className="px-3 py-2.5 text-center">Stock</th><th className="px-3 py-2.5 text-right">Price</th><th className="px-3 py-2.5 text-right">Sold · 30d</th><th className="px-3 py-2.5" /></tr></thead><tbody className="divide-y divide-[#f0f2f5] text-[9px]">{inventory.map((item) => <tr key={item.code}><td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className={`flex h-6 w-5 items-center justify-center rounded text-[6px] font-black text-white ${item.color}`}>{item.name.slice(0, 3).toUpperCase()}</span><span><span className="block font-bold text-[#303844]">{item.name}</span><span className="text-[8px] text-[#a1a8b3]">{item.code}</span></span></div></td><td className="px-3 py-2.5 text-[#687486]"><p>{item.game}</p><p className="text-[8px] text-[#a1a8b3]">{item.set}</p></td><td className="px-3 py-2.5 text-center"><span className={`rounded px-1.5 py-1 text-[8px] font-bold ${item.stock === '3' ? 'bg-[#fff4dc] text-[#b47a00]' : 'bg-[#e8f8f1] text-[#159568]'}`}>● {item.stock}</span></td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{item.price}</td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{item.sold}</td><td className="px-3 py-2.5 text-right"><Link to={`/superadmin/catalog?store=${encodeURIComponent(storeName)}`} aria-label={`View ${item.name} in catalog`} title="View product in catalog" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe3ee] bg-white text-[#2f65ff] shadow-[0_1px_2px_rgba(27,39,63,0.04)] transition hover:border-[#2f65ff] hover:bg-[#edf4ff]"><Eye size={12} /></Link></td></tr>)}</tbody></table></div>
            <div className="border-t border-[#edf0f4] px-3 py-3 text-[8px] text-[#a1a8b3]">Showing 4 of 2,842 products · sorted by recent sales <Link to="/superadmin/catalog" className="float-right font-bold text-[#2f65ff]">View full inventory →</Link></div>
          </SPAD_Panel>

          <div className="space-y-4"><SPAD_Panel title="Store sales trend" subtitle="Last 12 months" action={<span className="text-[9px] font-bold text-[#2f65ff]">+22%</span>}><div className="px-3 pb-3 pt-2"><svg viewBox="0 0 420 150" className="h-36 w-full" role="img" aria-label="Store sales trend chart"><path d="M8 130H412M8 95H412M8 60H412M8 25H412" stroke="#edf0f4" strokeWidth="1" /><path d="M8 115 C55 105 68 112 98 90 S150 92 176 80 S226 105 258 66 S300 78 332 42 S378 52 412 18" fill="none" stroke="#347cff" strokeWidth="3" strokeLinecap="round" /><path d="M8 115 C55 105 68 112 98 90 S150 92 176 80 S226 105 258 66 S300 78 332 42 S378 52 412 18 V150 H8Z" fill="url(#salesFillDetail)" opacity="0.14" /><defs><linearGradient id="salesFillDetail" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#347cff" /><stop offset="1" stopColor="#ffffff" /></linearGradient></defs></svg><div className="flex justify-between text-[8px] text-[#a1a8b3]"><span>Feb</span><span>May</span><span>Aug</span><span>Jan</span></div></div></SPAD_Panel><SPAD_Panel title="Store profile" subtitle="Read-only store information"><div className="space-y-2.5 px-4 pb-4 pt-3 text-[9px]"><div className="flex justify-between gap-3"><span className="text-[#a1a8b3]">Owner</span><span className="font-bold text-[#303844]">Narin Kittisak</span></div><div className="flex justify-between gap-3"><span className="text-[#a1a8b3]">Member since</span><span className="font-bold text-[#303844]">12 Jan 2025</span></div><div className="flex justify-between gap-3"><span className="text-[#a1a8b3]">Primary games</span><span className="font-bold text-[#303844]">Pokémon · One Piece</span></div><div className="flex justify-between gap-3"><span className="text-[#a1a8b3]">Public rating</span><span className="font-bold text-[#303844]">4.9 / 5.0 ★</span></div></div></SPAD_Panel></div>
        </div>
      </div>
    </SPAD_Shell>
  );
}
