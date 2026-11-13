import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_Field, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_Select, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { restrictAuctionBidder, loadAuctionDisputes, resolveAuctionDispute, loadSuperAuctions, loadAuctionSettings, saveAuctionSettings, loadAuctionAudit, moderateAuction, type AuctionOverview, type AuctionSettings, type AuctionAudit } from '../api/superadminAuctions';

const statuses = ['ALL', 'DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'LIVE', 'AWAITING_CHECKOUT', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ENDED_NO_BIDS', 'CHECKOUT_EXPIRED', 'CLOSED', 'SUSPENDED'];
const settingLabels: Record<Exclude<keyof AuctionSettings, 'bidIncrement'>, string> = {
  checkoutHours: 'Checkout window (hours)',
  antiSnipingMinutes: 'Anti-sniping window (minutes)',
  minDurationHours: 'Minimum duration (hours)',
  maxDurationHours: 'Maximum duration (hours)',
};
const settingKeys = Object.keys(settingLabels) as (keyof typeof settingLabels)[];
const changes = (details: string) => {
  try {
    const event = JSON.parse(details);
    const before = JSON.parse(event.before || '{}');
    const after = JSON.parse(event.after || '{}');
    return Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])).map((key) => `${key}: ${String(before[key] ?? '—')} → ${String(after[key] ?? '—')}`);
  } catch {
    try {
      const event = JSON.parse(details);
      return [String(event.after ?? details)];
    } catch {
      return [details];
    }
  }
};

const actionButton = 'rounded border px-2.5 py-1.5 text-[9px] font-bold transition-colors';

export const SuperAdminAuctions = () => {
  const requestId = useRef(0);
  const [bidderId, setBidderId] = useState('');
  const [restrictionReason, setRestrictionReason] = useState('');
  const [disputes, setDisputes] = useState<AuctionAudit[]>([]);
  const [resolutionReason, setResolutionReason] = useState('');
  const [data, setData] = useState<AuctionOverview | null>(null);
  const [settings, setSettings] = useState<AuctionSettings | null>(null);
  const [filters, setFilters] = useState({ query: '', status: 'ALL', storeId: '', startDate: '', endDate: '', page: '0' });
  const [audit, setAudit] = useState<AuctionAudit[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const next = await loadSuperAuctions(Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')));
      if (id === requestId.current) {
        setData(next);
        setError('');
      }
    } catch (requestError) {
      if (id === requestId.current) setError(requestError instanceof Error ? requestError.message : 'Could not load auctions.');
    }
  }, [filters]);

  useEffect(() => {
    void load();
    return () => { requestId.current++; };
  }, [load]);

  useEffect(() => {
    void loadAuctionSettings().then(setSettings).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load settings.'));
    void loadAuctionDisputes().then(setDisputes).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load disputes.'));
  }, []);

  const filter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : '0' }));

  const selectAuction = (id: number) => {
    setSelected(id);
    setReason('');
    setAudit([]);
    void loadAuctionAudit(id).then(setAudit).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Audit could not load.'));
  };

  const act = async (action: string) => {
    if (selected === null || !reason.trim()) {
      setError('Select an auction and provide a reason.');
      return;
    }
    setBusy(true);
    try {
      await moderateAuction(selected, action, reason);
      setMessage('Moderation recorded.');
      setReason('');
      setAudit(await loadAuctionAudit(selected));
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Moderation failed.');
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      setSettings(await saveAuctionSettings(settings));
      setMessage('Settings saved. Existing auction terms are unchanged.');
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const restrict = async (banned: boolean) => {
    if (!bidderId || !restrictionReason.trim()) return;
    setBusy(true);
    try {
      await restrictAuctionBidder(Number(bidderId), banned, restrictionReason);
      setMessage(banned ? 'Bidder suspended.' : 'Bidder reinstated.');
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Restriction failed.');
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (id: number, status: string) => {
    if (!resolutionReason.trim()) return;
    setBusy(true);
    try {
      await resolveAuctionDispute(id, status, resolutionReason);
      setDisputes(await loadAuctionDisputes());
      setResolutionReason('');
      setMessage('Dispute decision recorded.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not resolve dispute.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="Marketplace operations" title="Auction oversight" description="Review live auction activity, investigate incidents, and control platform-wide bidding rules." action={<Link to="/auction-notifications" className="rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[8px] font-bold text-[#687486] hover:border-[#2f65ff] hover:text-[#2f65ff]">Review notifications</Link>} />

        {error && <SPAD_Error message={error} onRetry={() => void load()} />}
        {message && <p role="status" className="rounded-lg border border-[#bcebd8] bg-[#eafaf3] px-4 py-3 text-[10px] font-semibold text-[#16865e]">{message}</p>}

        {data && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SPAD_StatCard label="Total bids" value={String(data.bidCount)} detail="Across selected auctions" tone="blue" variant="gradient" />
          <SPAD_StatCard label="Bid value" value={formatCurrency(data.bidValue)} detail="Current recorded bid value" tone="purple" variant="gradient" />
          <SPAD_StatCard label="Paid item GMV" value={formatCurrency(data.gmv)} detail="Excludes delivery" tone="teal" variant="gradient" />
          <SPAD_StatCard label="Sell-through" value={`${Math.round(data.sellThroughRate * 100)}%`} detail={`${data.sellThroughDenominator} resolved listings`} tone="orange" variant="gradient" />
          <SPAD_StatCard label="Checkout expired" value={String(data.expiredCount)} detail="Requires operational follow-up" tone="blue" />
        </div>}

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search auctions"><SPAD_Input aria-label="Search all auctions" value={filters.query} onChange={(event) => filter('query', event.target.value)} placeholder="Title or store" /></SPAD_FilterField>
          <SPAD_FilterField label="Status"><SPAD_Select aria-label="Auction status" value={filters.status} onChange={(event) => filter('status', event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</SPAD_Select></SPAD_FilterField>
          <SPAD_FilterField label="Store ID"><SPAD_Input aria-label="Store ID" type="number" min="1" value={filters.storeId} onChange={(event) => filter('storeId', event.target.value)} placeholder="Any store" /></SPAD_FilterField>
          <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-1"><SPAD_FilterField label="Created from"><SPAD_Input aria-label="Created from" type="date" value={filters.startDate} onChange={(event) => filter('startDate', event.target.value)} /></SPAD_FilterField><SPAD_FilterField label="Created to"><SPAD_Input aria-label="Created to" type="date" value={filters.endDate} onChange={(event) => filter('endDate', event.target.value)} /></SPAD_FilterField></div>
        </SPAD_FilterBar>

        <p className="text-[9px] text-[#8e99aa]">GMV excludes delivery. Sell-through = completed / (completed + no bids + checkout expired), within selected filters.</p>

        {!data ? <SPAD_Loading label="Loading auction oversight data…" /> : <>
          <SPAD_Panel title={`Auction listings · ${data.total} results`} subtitle="Select a listing to inspect its audit trail and apply moderation actions.">
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Auction</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Bids</th><th className="px-4 py-3 text-right">Starting price</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Review</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{data.items.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-[#8e99aa]">No auctions match these filters.</td></tr> : data.items.map((auction) => <tr key={auction.id} className={`transition-colors hover:bg-[#fafbfd] ${selected === auction.id ? 'bg-[#f5f8ff]' : ''}`}><td className="px-4 py-3"><p className="font-bold text-[#303844]">{auction.title}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{auction.game} · {auction.source}</p></td><td className="px-4 py-3 text-[#687486]">{auction.storeName}</td><td className="px-4 py-3"><SPAD_StatusBadge label={auction.status.replaceAll('_', ' ')} tone={statusTone(auction.status)} /></td><td className="px-4 py-3 text-right font-bold text-[#303844]">{auction.bidCount}</td><td className="px-4 py-3 text-right font-bold text-[#303844]">{formatCurrency(auction.startingPrice)}</td><td className="px-4 py-3 text-[8px] text-[#8e99aa]">{formatDate(auction.createdAt)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => selectAuction(auction.id)} className="font-bold text-[#2f65ff] hover:underline">Audit and moderate</button></td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-[#edf0f4] px-4 py-3 text-[8px] text-[#9aa3b1]"><span>{data.total} auctions · Page {Number(filters.page) + 1}</span><div className="flex gap-1"><button type="button" disabled={Number(filters.page) === 0} onClick={() => filter('page', String(Number(filters.page) - 1))} className="h-6 rounded border border-[#e1e6ee] px-2 text-[#687486] disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={(Number(filters.page) + 1) * 20 >= data.total} onClick={() => filter('page', String(Number(filters.page) + 1))} className="h-6 rounded border border-[#e1e6ee] px-2 text-[#687486] disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
          </SPAD_Panel>

          <SPAD_Panel title="Seller incidents" subtitle="Cancelled, suspended, closed and checkout-expired listings that may need investigation."><div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(data.sellerIncidents).length === 0 ? <p className="text-[10px] text-[#8e99aa]">No seller incidents in the selected period.</p> : Object.entries(data.sellerIncidents).map(([seller, count]) => <div key={seller} className="rounded border border-[#edf0f4] bg-[#fafbfd] px-3 py-2"><p className="truncate text-[9px] font-bold text-[#303844]">{seller}</p><p className="mt-1 text-lg font-black text-[#c27b1b]">{count}</p><p className="text-[8px] text-[#8e99aa]">incident listings</p></div>)}</div></SPAD_Panel>
        </>}

        {selected !== null && <SPAD_Panel title={`Auction #${selected} audit and moderation`} subtitle="Record a reason before suspending or force-closing a listing." action={<button type="button" onClick={() => setSelected(null)} className="text-[9px] font-bold text-[#687486] hover:text-[#2f65ff]">Close</button>}><div className="space-y-3 p-4"><SPAD_Field label="Reason"><textarea className="min-h-20 w-full rounded border border-[#dfe4eb] px-2.5 py-2 text-[10px] outline-none focus:border-[#2f65ff]" value={reason} onChange={(event) => setReason(event.target.value)} /></SPAD_Field><div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !reason.trim()} onClick={() => void act('SUSPEND')} className={`${actionButton} border-[#f2baba] text-[#dc4c4c] hover:bg-[#fff0f0] disabled:opacity-40`}>Suspend auction</button><button type="button" disabled={busy || !reason.trim()} onClick={() => void act('CLOSE')} className={`${actionButton} border-[#f2baba] text-[#dc4c4c] hover:bg-[#fff0f0] disabled:opacity-40`}>Force close</button></div><p className="text-[9px] text-[#8e99aa]">Winner checkout and completed orders require dispute review before intervention.</p>{audit.length === 0 ? <p className="border-t border-[#edf0f4] pt-3 text-[10px] text-[#8e99aa]">No audit events recorded.</p> : <div className="divide-y divide-[#edf0f4] border-t border-[#edf0f4]">{audit.map((event) => <article key={event.id} className="py-3 text-[10px]"><p className="font-semibold text-[#303844]">{event.action} · {event.actorId === null ? 'System' : `User ${event.actorId}`} · {formatDate(event.createdAt)}</p><ul className="mt-1 list-disc pl-4 text-[#687486]">{changes(event.details).map((change, index) => <li key={index}>{change}</li>)}</ul></article>)}</div>}</div></SPAD_Panel>}

        <div className="grid gap-4 xl:grid-cols-2">
          <SPAD_Panel title="Bidder access" subtitle="Suspend or reinstate bidding access with an auditable reason."><div className="space-y-3 p-4"><div className="grid gap-3 sm:grid-cols-2"><SPAD_Field label="Bidder user ID"><SPAD_Input type="number" min="1" value={bidderId} onChange={(event) => setBidderId(event.target.value)} placeholder="User ID" /></SPAD_Field><SPAD_Field label="Restriction or appeal reason"><SPAD_Input value={restrictionReason} onChange={(event) => setRestrictionReason(event.target.value)} placeholder="Reason" /></SPAD_Field></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !bidderId || !restrictionReason.trim()} onClick={() => void restrict(true)} className={`${actionButton} border-[#f2baba] text-[#dc4c4c] hover:bg-[#fff0f0] disabled:opacity-40`}>Suspend bidder</button><button type="button" disabled={busy || !bidderId || !restrictionReason.trim()} onClick={() => void restrict(false)} className={`${actionButton} border-[#b9d5ff] text-[#2f65ff] hover:bg-[#edf4ff] disabled:opacity-40`}>Reinstate bidder</button></div></div></SPAD_Panel>
          <SPAD_Panel title="Auction disputes" subtitle="Review buyer-reported issues and record a resolution."><div className="space-y-3 p-4"><SPAD_Field label="Decision reason"><textarea maxLength={2000} className="min-h-16 w-full rounded border border-[#dfe4eb] px-2.5 py-2 text-[10px] outline-none focus:border-[#2f65ff]" value={resolutionReason} onChange={(event) => setResolutionReason(event.target.value)} placeholder="Explain the decision" /></SPAD_Field>{disputes.length === 0 ? <p className="text-[10px] text-[#8e99aa]">No disputes.</p> : <div className="divide-y divide-[#edf0f4]">{disputes.map((dispute) => <article className="py-3 text-[10px]" key={dispute.id}><p className="font-semibold text-[#303844]">{dispute.action} · User {dispute.actorId} · {formatDate(dispute.createdAt)}</p><p className="mt-1 whitespace-pre-wrap text-[#687486]">{dispute.details}</p>{dispute.action === 'OPEN' && <div className="mt-2 flex gap-2"><button type="button" disabled={busy || !resolutionReason.trim()} onClick={() => void resolve(dispute.id, 'RESOLVED')} className={`${actionButton} border-[#bcebd8] text-[#159568] hover:bg-[#e8f8f1] disabled:opacity-40`}>Resolve</button><button type="button" disabled={busy || !resolutionReason.trim()} onClick={() => void resolve(dispute.id, 'DISMISSED')} className={`${actionButton} border-[#dfe4eb] text-[#687486] hover:bg-[#f4f7fb] disabled:opacity-40`}>Dismiss</button></div>}</article>)}</div>}</div></SPAD_Panel>
        </div>

        {settings && <SPAD_Panel title="Platform auction defaults" subtitle="Bid increments are set per auction by the seller or administrator. These defaults cover timing and checkout rules only."><form onSubmit={(event) => void save(event)} className="space-y-4 p-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{settingKeys.map((key) => <SPAD_Field key={key} label={settingLabels[key]}><SPAD_Input required type="number" min={key === 'antiSnipingMinutes' ? 0 : 1} max={key === 'antiSnipingMinutes' ? 60 : key === 'checkoutHours' ? 168 : 720} step="1" value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: Number(event.target.value) })} /></SPAD_Field>)}</div><button type="submit" disabled={busy} className="rounded bg-[#2f65ff] px-3 py-2 text-[9px] font-bold text-white hover:bg-[#2455de] disabled:cursor-not-allowed disabled:opacity-50">Save auction settings</button></form></SPAD_Panel>}
      </div>
    </SPAD_Shell>
  );
};
