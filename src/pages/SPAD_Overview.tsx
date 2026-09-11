import { useState } from 'react';
import type { DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { SPAD_ExportButton, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const revenueBars = [42, 54, 48, 66, 58, 78, 64, 88, 72, 94, 82, 90];
const ordersBars = [32, 44, 38, 55, 50, 63, 58, 72, 62, 78, 68, 75];

const topStores = [
  { name: 'Pokemon Center TH', initials: 'PC', gmv: '฿1.21M', change: '+22%', tone: 'orange' },
  { name: 'Card Realm', initials: 'CR', gmv: '฿986K', change: '+16%', tone: 'blue' },
  { name: 'Meta TCG', initials: 'MT', gmv: '฿742K', change: '+11%', tone: 'purple' },
  { name: "Dragon's Shield", initials: 'DS', gmv: '฿635K', change: '+9%', tone: 'teal' },
];

const catalogHealthRows = [
  { label: 'In stock', value: '14,468', percentage: '78.4%', color: 'bg-[#347cff]' },
  { label: 'Low stock', value: '1,276', percentage: '6.9%', color: 'bg-[#f59b24]' },
  { label: 'Out of stock', value: '2,718', percentage: '14.7%', color: 'bg-[#e46a6a]' },
];

const onboardingRows = [
  { label: 'Verified & live', value: '119', color: 'bg-[#45bd8d]' },
  { label: 'Document review', value: '3', color: 'bg-[#f59b24]' },
  { label: 'Action needed', value: '2', color: 'bg-[#e46a6a]' },
];

const catalogByGame = [
  { name: 'Pokémon', listings: '7,939', percentage: 43, color: 'bg-[#347cff]' },
  { name: 'One Piece', listings: '5,354', percentage: 29, color: 'bg-[#45bd8d]' },
  { name: 'MTG', listings: '2,954', percentage: 16, color: 'bg-[#f59b24]' },
  { name: 'Other games', listings: '2,215', percentage: 12, color: 'bg-[#7659c9]' },
];

const initialStats = [
  { id: 'stores', label: 'Total stores', value: '124', detail: '+8 this month', tone: 'blue' as const },
  { id: 'products', label: 'Products listed', value: '18,462', detail: '+1,208 in the last 30 days', tone: 'teal' as const },
  { id: 'gmv', label: 'Platform GMV · 30 days', value: '฿8.42M', detail: '+14.8% vs previous period', tone: 'orange' as const },
  { id: 'orders', label: 'Orders · 30 days', value: '1,284', detail: 'Average order value ฿1,864', tone: 'purple' as const },
];

export function SPAD_Overview() {
  const [stats, setStats] = useState(initialStats);
  const [draggedStatId, setDraggedStatId] = useState<string | null>(null);
  const [dragOverStatId, setDragOverStatId] = useState<string | null>(null);

  const handleStatDragStart = (event: DragEvent<HTMLButtonElement>, statId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', statId);
    setDraggedStatId(statId);
  };

  const handleStatDrop = (event: DragEvent<HTMLDivElement>, targetStatId: string) => {
    event.preventDefault();
    const sourceStatId = event.dataTransfer.getData('text/plain') || draggedStatId;
    if (!sourceStatId || sourceStatId === targetStatId) {
      setDragOverStatId(null);
      return;
    }

    setStats((currentStats) => {
      const sourceIndex = currentStats.findIndex((stat) => stat.id === sourceStatId);
      const targetIndex = currentStats.findIndex((stat) => stat.id === targetStatId);
      if (sourceIndex < 0 || targetIndex < 0) return currentStats;
      const nextStats = [...currentStats];
      const [movedStat] = nextStats.splice(sourceIndex, 1);
      nextStats.splice(targetIndex, 0, movedStat);
      return nextStats;
    });
    setDraggedStatId(null);
    setDragOverStatId(null);
  };

  const handleStatDragEnd = () => {
    setDraggedStatId(null);
    setDragOverStatId(null);
  };

  return (
    <SPAD_Shell>
      <div className="mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-none flex-col gap-4">
        <SPAD_SectionHeading
          eyebrow="01 / Overview"
          title="Platform Overview"
          description="Monitor marketplace activity, stores and transactions at a glance."
          action={<><span className="hidden rounded border border-[#e1e6ee] bg-white px-3 py-2 text-[8px] font-semibold text-[#687486] sm:inline-flex">+ No edit permissions</span><SPAD_ExportButton label="Export report" fileName="optracard-overview.csv" rows={stats.map((stat) => ({ Metric: stat.label, Value: stat.value, Detail: stat.detail ?? '' }))} /></>}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <SPAD_StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              tone={stat.tone}
              variant="gradient"
              dragHandle={{
                label: `Drag ${stat.label} card to reorder`,
                onDragStart: (event) => handleStatDragStart(event, stat.id),
                onDragEnd: handleStatDragEnd,
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (stat.id !== draggedStatId) setDragOverStatId(stat.id);
              }}
              onDrop={(event) => handleStatDrop(event, stat.id)}
              onDragLeave={() => setDragOverStatId(null)}
              isDragging={draggedStatId === stat.id}
              isDragOver={dragOverStatId === stat.id}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
          <SPAD_Panel title="Marketplace performance" subtitle="GMV and completed orders across the last 12 months" action={<span className="text-[8px] text-[#8e99aa]"><span className="text-[#347cff]">●</span> GMV&nbsp;&nbsp; <span className="text-[#45bd8d]">●</span> Orders</span>}>
            <div className="px-4 pb-4 pt-3">
              <div className="relative h-48 border-b border-[#edf0f4] bg-[linear-gradient(to_bottom,transparent_24%,#edf0f4_25%,transparent_26%,transparent_49%,#edf0f4_50%,transparent_51%,transparent_74%,#edf0f4_75%,transparent_76%)]">
                <div className="absolute inset-x-5 bottom-0 top-2 flex items-end justify-between gap-2">
                  {revenueBars.map((height, index) => (
                    <div key={index} className="flex h-full flex-1 items-end justify-center gap-1">
                      <div className="w-2 rounded-t-sm bg-[#347cff]" style={{ height: `${height}%` }} />
                      <div className="w-2 rounded-t-sm bg-[#45bd8d]" style={{ height: `${ordersBars[index]}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between px-4 text-[8px] text-[#a1a8b3]">{['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month) => <span key={month}>{month}</span>)}</div>
            </div>
          </SPAD_Panel>

          <SPAD_Panel title="Top stores by GMV" subtitle="Highest-performing stores this month" action={<Link to="/superadmin/stores" className="text-[8px] font-bold text-[#2f65ff]">View all →</Link>}>
            <div className="px-4">
              <div className="flex justify-between border-b border-[#edf0f4] py-3 text-[8px] font-bold uppercase tracking-[0.06em] text-[#a1a8b3]"><span>Store</span><span>GMV&nbsp;&nbsp;&nbsp;&nbsp; Change</span></div>
              {topStores.map((store) => <div key={store.name} className="flex items-center gap-2 border-b border-[#f0f2f5] py-3 last:border-0"><span className={`flex h-6 w-6 items-center justify-center rounded-md text-[8px] font-black ${store.tone === 'orange' ? 'bg-[#fff0d9] text-[#e89420]' : store.tone === 'blue' ? 'bg-[#edf4ff] text-[#347cff]' : store.tone === 'purple' ? 'bg-[#f0ebff] text-[#7659c9]' : 'bg-[#e8f8f1] text-[#159568]'}`}>{store.initials}</span><span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-[#303844]">{store.name}</span><span className="text-[9px] font-bold text-[#303844]">{store.gmv}</span><span className="w-8 text-right text-[8px] font-bold text-[#159568]">{store.change}</span></div>)}
            </div>
          </SPAD_Panel>
        </div>

        <div className="grid flex-1 items-stretch gap-4 lg:grid-cols-3 [&>section]:min-h-[150px]">
          <SPAD_Panel title="Catalog health" subtitle="Products with stock available" className="flex h-full flex-col" action={<span className="text-sm font-black text-[#263142]">78.4%</span>}>
            <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
              <div className="flex h-2 overflow-hidden rounded-full bg-[#edf0f4]">
                <div className="w-[78.4%] bg-[#347cff]" />
                <div className="w-[6.9%] bg-[#f59b24]" />
                <div className="w-[14.7%] bg-[#e46a6a]" />
              </div>
              <p className="mt-2 text-[8px] text-[#a1a8b3]">14,468 of 18,462 listed products are in stock</p>
              <div className="mt-5 space-y-3">
                {catalogHealthRows.map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${row.color}`} />
                    <span className="flex-1 text-[9px] font-semibold text-[#465163]">{row.label}</span>
                    <span className="text-[9px] font-bold text-[#263142]">{row.value}</span>
                    <span className="w-8 text-right text-[8px] text-[#8e99aa]">{row.percentage}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto rounded-md bg-[#f7f9fc] p-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#8e99aa]">Inventory signal</p>
                <p className="mt-1 text-[9px] font-semibold text-[#465163]">1,276 low-stock SKUs need attention</p>
                <Link to="/superadmin/catalog" className="mt-2 inline-flex text-[8px] font-bold text-[#2f65ff]">Open catalog →</Link>
              </div>
            </div>
          </SPAD_Panel>

          <SPAD_Panel title="Store onboarding" subtitle="Verified stores" className="flex h-full flex-col" action={<span className="text-sm font-black text-[#263142]">119 / 124</span>}>
            <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#edf0f4]">
                  <div className="w-[95.9%] bg-[#45bd8d]" />
                  <div className="w-[4.1%] bg-[#f59b24]" />
                </div>
                <span className="text-[9px] font-bold text-[#159568]">95.9%</span>
              </div>
              <p className="mt-2 text-[8px] text-[#a1a8b3]">5 stores are waiting for onboarding review</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {onboardingRows.map((row) => (
                  <div key={row.label} className="rounded-md border border-[#edf0f4] bg-[#fbfcfe] p-2.5">
                    <span className={`mb-2 block h-1.5 w-8 rounded-full ${row.color}`} />
                    <p className="text-lg font-black tracking-tight text-[#263142]">{row.value}</p>
                    <p className="mt-1 text-[8px] leading-3 text-[#8e99aa]">{row.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto rounded-md bg-[#f7f9fc] p-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#8e99aa]">Next review queue</p>
                <p className="mt-1 text-[9px] font-semibold text-[#465163]">2 stores need follow-up before approval</p>
                <Link to="/superadmin/stores" className="mt-2 inline-flex text-[8px] font-bold text-[#2f65ff]">Review stores →</Link>
              </div>
            </div>
          </SPAD_Panel>

          <SPAD_Panel title="Catalog by game" subtitle="Listings by primary game" className="flex h-full flex-col">
            <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[7px] border-[#347cff] border-r-[#45bd8d] border-b-[#f59b24] text-[9px] font-black text-[#263142]">18.4K</div>
                <div className="space-y-1 text-[8px] text-[#687486]">
                  {catalogByGame.map((game) => <p key={game.name}><span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${game.color}`} />{game.name}&nbsp; {game.percentage}%</p>)}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {catalogByGame.map((game) => (
                  <div key={game.name}>
                    <div className="mb-1 flex items-center justify-between text-[8px]">
                      <span className="font-semibold text-[#465163]">{game.name}</span>
                      <span className="text-[#8e99aa]">{game.listings} listings</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#edf0f4]"><div className={`h-full rounded-full ${game.color}`} style={{ width: `${game.percentage}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-[#edf0f4] pt-3">
                <span className="text-[8px] text-[#8e99aa]">18,462 total listings</span>
                <Link to="/superadmin/catalog" className="text-[8px] font-bold text-[#2f65ff]">Explore catalog →</Link>
              </div>
            </div>
          </SPAD_Panel>
        </div>
      </div>
    </SPAD_Shell>
  );
}
