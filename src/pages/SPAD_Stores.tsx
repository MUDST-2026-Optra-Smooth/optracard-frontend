import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const stores = [
  { id: 'pokemon-center', name: 'Pokemon Center TH', owner: 'Narin K.', storeId: 'ST-000124', games: ['Pokémon', 'One Piece'], products: '2,842', gmv: '฿1,214,800', change: '+22%', active: 'Today\n14:12', status: 'Active', tone: 'green' as const, initials: 'PC', color: 'orange' },
  { id: 'card-realm', name: 'Card Realm', owner: 'Ploy S.', storeId: 'ST-000118', games: ['Pokémon', 'MTG'], products: '1,964', gmv: '฿986,200', change: '+16%', active: 'Today\n13:48', status: 'Active', tone: 'green' as const, initials: 'CR', color: 'blue' },
  { id: 'meta-tcg', name: 'Meta TCG', owner: 'Thanawat P.', storeId: 'ST-000113', games: ['One Piece', 'Pokémon'], products: '3,210', gmv: '฿742,400', change: '+11%', active: 'Yesterday\n18:09', status: 'Active', tone: 'green' as const, initials: 'MT', color: 'purple' },
  { id: 'dragons-shield', name: "Dragon's Shield", owner: 'Mook J.', storeId: 'ST-000107', games: ['Pokémon', 'Dragon Ball'], products: '1,482', gmv: '฿635,100', change: '+9%', active: 'Yesterday\n17:42', status: 'Active', tone: 'green' as const, initials: 'DS', color: 'teal' },
  { id: 'collectors-club', name: "Collector's Club", owner: 'Krittisak R.', storeId: 'ST-000102', games: ['MTG', 'Pokémon'], products: '988', gmv: '฿498,750', change: '+7%', active: '18 Aug\n21:05', status: 'Active', tone: 'green' as const, initials: 'CC', color: 'red' },
  { id: 'shuffle-house', name: 'Shuffle House', owner: 'Phanupong T.', storeId: 'ST-000098', games: ['Pokémon', 'One Piece'], products: '412', gmv: '฿86,940', change: 'New', active: '18 Aug\n12:20', status: 'Pending review', tone: 'orange' as const, initials: 'SH', color: 'blue' },
];

const avatarStyles: Record<string, string> = {
  orange: 'bg-[#f59b32] text-white',
  blue: 'bg-[#4d72dc] text-white',
  purple: 'bg-[#7453bd] text-white',
  teal: 'bg-[#32a487] text-white',
  red: 'bg-[#db5870] text-white',
};

export function SPAD_Stores() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [game, setGame] = useState('');
  const [status, setStatus] = useState('');
  const visibleStores = useMemo(() => stores.filter((store) => {
    const matchesQuery = `${store.name} ${store.owner} ${store.storeId}`.toLowerCase().includes(appliedQuery.toLowerCase());
    const matchesGame = !game || store.games.some((storeGame) => storeGame.toLowerCase().includes(game.toLowerCase()));
    const matchesStatus = !status || store.status.toLowerCase().includes(status.toLowerCase());
    return matchesQuery && matchesGame && matchesStatus;
  }), [appliedQuery, game, status]);

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="02 / Stores" title="Stores" description="Browse and monitor active selling on the TCG marketplace" action={<><span className="hidden rounded border border-[#e1e6ee] bg-white px-3 py-2 text-[8px] font-semibold text-[#687486] sm:inline-flex">↗ Read-only directory</span><SPAD_ExportButton label="Export store list" fileName="optracard-stores.csv" rows={stores.map((store) => ({ Store: store.name, Owner: store.owner, 'Store ID': store.storeId, Products: store.products, 'GMV · 30 days': store.gmv, Status: store.status }))} /></>} />

        <div className="grid gap-3 md:grid-cols-3">
          <SPAD_StatCard label="Total stores" value="124" detail="+8 this month" />
          <SPAD_StatCard label="Active in last 30 days" value="118" detail="95.2%" tone="teal" />
          <SPAD_StatCard label="Stores with live inventory" value="121" detail="97.6%" tone="teal" />
        </div>

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search store"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Store name, owner or store ID" /></SPAD_FilterField>
          <SPAD_FilterField label="Game focus"><SPAD_Input value={game} onChange={(event) => setGame(event.target.value)} placeholder="Type a game" /></SPAD_FilterField>
          <SPAD_FilterField label="Store status"><SPAD_Input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Type a status" /></SPAD_FilterField>
          <button type="button" onClick={() => setAppliedQuery(query.trim())} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white hover:bg-[#1647c4]">⌕ Search</button>
        </SPAD_FilterBar>

        <SPAD_Panel title={`All stores · 124 results`} subtitle="Live stores registered on the platform with public inventory." action={<span className="text-[8px] text-[#a1a8b3]">Sorted by GMV · 30 days ↑</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">Store</th><th className="px-3 py-2.5">Owner / Store ID</th><th className="px-3 py-2.5">Primary games</th><th className="px-3 py-2.5 text-right">Products listed</th><th className="px-3 py-2.5 text-right">GMV · 30 days</th><th className="px-3 py-2.5 text-right">Last active</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5" /></tr></thead>
              <tbody className="divide-y divide-[#f0f2f5] text-[9px]">
                {visibleStores.map((store) => <tr key={store.id} className="hover:bg-[#fafbfd]"><td className="px-3 py-2.5"><Link to={`/superadmin/stores/${store.id}`} className="flex items-center gap-2"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[8px] font-black ${avatarStyles[store.color]}`}>{store.initials}</span><span><span className="block font-bold text-[#303844]">{store.name} <span className="font-normal text-[#b1bac7">· Verified 12 Jan 2025</span></span><span className="mt-0.5 block text-[8px] text-[#a1a8b3]">{store.storeId}</span></span></Link></td><td className="px-3 py-2.5"><p className="font-bold text-[#303844]">{store.owner}</p><p className="text-[8px] text-[#a1a8b3]">{store.storeId}</p></td><td className="px-3 py-2.5 text-[#687486]"><p>{store.games[0]}</p><p className="text-[8px] text-[#a1a8b3]">{store.games[1]}</p></td><td className="px-3 py-2.5 text-right font-bold text-[#303844]">{store.products}</td><td className="px-3 py-2.5 text-right"><p className="font-bold text-[#303844]">{store.gmv}</p><span className={`mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[7px] font-bold ${store.change === 'New' ? 'bg-[#f0ebff] text-[#7659c9]' : 'bg-[#e8f8f1] text-[#159568]'}`}>● {store.change}</span></td><td className="whitespace-pre-line px-3 py-2.5 text-right text-[8px] text-[#687486]">{store.active}</td><td className="px-3 py-2.5"><SPAD_StatusBadge label={store.status} tone={store.tone} /></td><td className="px-3 py-2.5 text-right"><Link to={`/superadmin/stores/${store.id}`} aria-label={`View ${store.name}`} title="View store" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe3ee] bg-white text-[#2f65ff] shadow-[0_1px_2px_rgba(27,39,63,0.04)] transition hover:border-[#2f65ff] hover:bg-[#edf4ff]"><Eye size={12} /></Link></td></tr>)}
              </tbody>
            </table>
          </div>
          <SPAD_Pagination count={`Showing ${visibleStores.length ? '1–6' : '0'} of 124 stores`} />
        </SPAD_Panel>
      </div>
    </SPAD_Shell>
  );
}
