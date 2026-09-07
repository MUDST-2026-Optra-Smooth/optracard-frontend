import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const products = [
  { id: 'PD-0001', name: 'Charizard ex · 223/197', code: 'SV03-223/197 · Holo rare', store: 'Pokemon Center TH', game: 'Pokémon', set: 'Scarlet & Violet · 151', stock: '12', price: '฿2,800', sold: '8', status: 'Live', tone: 'green' as const, color: 'bg-[#f08a35]' },
  { id: 'PD-0002', name: 'Monkey D. Luffy · SEC', code: 'OP05-119 · Secret rare', store: 'Meta TCG', game: 'One Piece', set: 'Romance Dawn', stock: '3', price: '฿3,200', sold: '3', status: 'Live', tone: 'green' as const, color: 'bg-[#4e79d9]' },
  { id: 'PD-0003', name: 'Pikachu VMAX · Rainbow', code: 'SWSH-188 · Ultra rare', store: 'Card Realm', game: 'Pokémon', set: 'Vivid Voltage', stock: '24', price: '฿980', sold: '14', status: 'Live', tone: 'green' as const, color: 'bg-[#38a679]' },
  { id: 'PD-0004', name: 'Black Lotus · Unlimited', code: 'MTG-0001 · Rare', store: "Collector's Club", game: 'MTG', set: 'Unlimited', stock: '0', price: '฿42,000', sold: '1', status: 'Sold out', tone: 'red' as const, color: 'bg-[#7453bd]' },
  { id: 'PD-0005', name: 'Blue-Eyes White Dragon', code: 'QCCP-EN001 · Ultra rare', store: "Dragon's Shield", game: 'Yu-Gi-Oh!', set: 'Quarter Century', stock: '8', price: '฿1,450', sold: '6', status: 'Live', tone: 'green' as const, color: 'bg-[#4e79d9]' },
];

export function SPAD_Catalog() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [game, setGame] = useState('');
  const [stock, setStock] = useState('');
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.code} ${product.store}`.toLowerCase().includes(appliedQuery.toLowerCase());
    const matchesGame = !game || product.game.toLowerCase().includes(game.toLowerCase());
    const matchesStock = !stock || (stock.toLowerCase().includes('in stock') && product.stock !== '0') || (stock.toLowerCase().includes('out') && product.stock === '0') || product.status.toLowerCase().includes(stock.toLowerCase());
    return matchesQuery && matchesGame && matchesStock;
  }), [appliedQuery, game, stock]);

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="04 / Catalog" title="Catalog Explorer" description="See what products are listed across the marketplace" action={<><span className="hidden rounded border border-[#e1e6ee] bg-white px-3 py-2 text-[8px] font-semibold text-[#687486] sm:inline-flex">+ No edit permissions</span><SPAD_ExportButton label="Export catalog" fileName="optracard-catalog.csv" rows={products.map((product) => ({ Product: product.name, Store: product.store, Game: product.game, Stock: product.stock, Price: product.price, Status: product.status }))} /></>} />

        <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Total products" value="18,462" detail="+7.0%" /><SPAD_StatCard label="In stock now" value="14,468" detail="78.4%" tone="teal" /><SPAD_StatCard label="Avg. listing price" value="฿1,864" detail="+4.2%" tone="orange" /></div>

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search product"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Card name, product ID or set" /></SPAD_FilterField>
          <SPAD_FilterField label="Card game"><SPAD_Input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Type a game" /></SPAD_FilterField>
          <SPAD_FilterField label="Stock status"><SPAD_Input value={stock} onChange={(event) => setStock(event.target.value)} placeholder="Type a stock status" /></SPAD_FilterField>
          <button type="button" onClick={() => setAppliedQuery(query.trim())} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white hover:bg-[#1647c4]">⌕ Search</button>
        </SPAD_FilterBar>

        <SPAD_Panel title="Marketplace catalog · 18,462 listings" subtitle="Product details are visible for monitoring; price and stock information are unchanged." action={<span className="text-[8px] text-[#a1a8b3]">Sorted by recent listing ↑</span>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">Product</th><th className="px-3 py-2.5">Store</th><th className="px-3 py-2.5">Game / set</th><th className="px-3 py-2.5 text-center">Stock</th><th className="px-3 py-2.5 text-right">Listing price</th><th className="px-3 py-2.5 text-right">Sold · 30d</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5" /></tr></thead><tbody className="divide-y divide-[#f0f2f5] text-[9px]">{visibleProducts.map((product) => <tr key={product.id} className="hover:bg-[#fafbfd]"><td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className={`flex h-6 w-5 items-center justify-center rounded text-[6px] font-black text-white ${product.color}`}>{product.name.slice(0, 3).toUpperCase()}</span><span><span className="block font-bold text-[#303844]">{product.name}</span><span className="text-[8px] text-[#a1a8b3]">{product.code}</span></span></div></td><td className="px-3 py-2.5 font-semibold text-[#303844]">{product.store}</td><td className="px-3 py-2.5 text-[#687486]"><p>{product.game}</p><p className="text-[8px] text-[#a1a8b3]">{product.set}</p></td><td className="px-3 py-2.5 text-center"><span className={`rounded px-1.5 py-1 text-[8px] font-bold ${product.stock === '0' ? 'bg-[#fff0f0] text-[#dc4c4c]' : product.stock === '3' ? 'bg-[#fff4dc] text-[#b47a00]' : 'bg-[#e8f8f1] text-[#159568]'}`}>● {product.stock}</span></td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{product.price}</td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{product.sold}</td><td className="px-3 py-2.5"><SPAD_StatusBadge label={product.status} tone={product.tone} /></td><td className="px-3 py-2.5 text-right"><Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} title="View product" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe3ee] bg-white text-[#2f65ff] shadow-[0_1px_2px_rgba(27,39,63,0.04)] transition hover:border-[#2f65ff] hover:bg-[#edf4ff]"><Eye size={12} /></Link></td></tr>)}</tbody></table></div>
          <SPAD_Pagination count={`Showing ${visibleProducts.length ? '1–5' : '0'} of 18,462 products`} />
        </SPAD_Panel>
      </div>
    </SPAD_Shell>
  );
}
