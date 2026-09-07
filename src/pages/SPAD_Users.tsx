import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const users = [
  { id: 'USR-05112', name: 'Narin K.', email: 'narin.k@example.com', type: 'Verified Seller', orders: '124 Orders', trades: '12 Trades', joined: '12 Jan\n2025', status: 'Active', tone: 'green' as const, color: 'bg-[#e7e7e7]' },
  { id: 'USR-05113', name: 'TCG Player', email: 'player@gmail.com', type: 'Regular User', orders: '5 Orders', trades: '0 Trades', joined: '15 Feb\n2025', status: 'Active', tone: 'green' as const, color: 'bg-[#e7e7e7]' },
  { id: 'USR-05114', name: 'Scream Alert', email: 'alert@gmail.com', type: 'Regular User', orders: '0 Orders', trades: '2 Trades', joined: '20 Aug\n2025', status: 'Suspended', tone: 'red' as const, color: 'bg-[#e7e7e7]' },
];

export function SPAD_Users() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [accountType, setAccountType] = useState('');
  const [status, setStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<(typeof users)[number] | null>(null);
  const visibleUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(appliedQuery.toLowerCase());
    const matchesType = !accountType || user.type.toLowerCase().includes(accountType.toLowerCase());
    const matchesStatus = !status || user.status.toLowerCase().includes(status.toLowerCase());
    return matchesQuery && matchesType && matchesStatus;
  }), [accountType, appliedQuery, status]);

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="06 / User & Staff Management / Manage Users" title="Platform Users" description="Manage registered users, verified sellers, and account statuses" action={<><Link to="/superadmin/staff" className="text-[8px] font-bold text-[#2f65ff]">← View Staff &amp; Admins</Link><SPAD_ExportButton label="Export users" fileName="optracard-users.csv" rows={users.map((user) => ({ User: user.name, Email: user.email, 'User ID': user.id, Type: user.type, Orders: user.orders, Status: user.status }))} /></>} />

        <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Total users" value="1,240" detail="+150 this month" /><SPAD_StatCard label="Verified sellers" value="342" detail="27.5% of users" tone="teal" /><SPAD_StatCard label="Banned / suspended" value="12" detail="1.0% of users" tone="orange" /></div>

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search users"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username, email, or user ID" /></SPAD_FilterField>
          <SPAD_FilterField label="Account type filter"><SPAD_Input value={accountType} onChange={(event) => setAccountType(event.target.value)} placeholder="Type an account type" /></SPAD_FilterField>
          <SPAD_FilterField label="Status filter"><SPAD_Input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Type a status" /></SPAD_FilterField>
          <button type="button" onClick={() => setAppliedQuery(query.trim())} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white hover:bg-[#1647c4]">⌕ Search</button>
        </SPAD_FilterBar>

        <SPAD_Panel title="All platform users · 1,240 results" subtitle="View and manage registered buyers, sellers, and account status." action={<span className="text-[8px] text-[#a1a8b3]">Showing first 3</span>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">User / Email</th><th className="px-3 py-2.5">User ID</th><th className="px-3 py-2.5">Account Type</th><th className="px-3 py-2.5 text-right">Total Orders / Trades</th><th className="px-3 py-2.5 text-right">Joined Date</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5" /></tr></thead><tbody className="divide-y divide-[#f0f2f5] text-[9px]">{visibleUsers.map((user) => <tr key={user.id} className="hover:bg-[#fafbfd]"><td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className={`flex h-6 w-6 items-center justify-center rounded ${user.color}`} /><span><span className="block font-bold text-[#303844]">{user.name}</span><span className="text-[8px] text-[#a1a8b3]">{user.email}</span></span></div></td><td className="px-3 py-2.5 font-bold text-[#303844]">{user.id}</td><td className="px-3 py-2.5 text-[#687486]">{user.type}</td><td className="px-3 py-2.5 text-right"><p className="font-bold text-[#159568]">{user.orders}</p><p className="text-[8px] text-[#dc4c4c]">{user.trades}</p></td><td className="whitespace-pre-line px-3 py-2.5 text-right text-[8px] text-[#687486]">{user.joined}</td><td className="px-3 py-2.5"><SPAD_StatusBadge label={user.status} tone={user.tone} /></td><td className="px-3 py-2.5 text-right"><button type="button" onClick={() => setSelectedUser(user)} aria-label={`View ${user.name}`} title="View user" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe3ee] bg-white text-[#2f65ff] shadow-[0_1px_2px_rgba(27,39,63,0.04)] transition hover:border-[#2f65ff] hover:bg-[#edf4ff]"><Eye size={12} /></button></td></tr>)}</tbody></table></div>
          <SPAD_Pagination count={`Showing ${visibleUsers.length ? '1–3' : '0'} of 1,240 users`} />
        </SPAD_Panel>
        {selectedUser && <SPAD_Panel title={selectedUser.name} subtitle="Read-only user profile" action={<button type="button" onClick={() => setSelectedUser(null)} className="text-[9px] font-bold text-[#2f65ff]">Close</button>}><div className="grid gap-3 px-4 py-4 text-[9px] sm:grid-cols-4"><div><p className="text-[#a1a8b3]">Email</p><p className="mt-1 font-bold text-[#303844]">{selectedUser.email}</p></div><div><p className="text-[#a1a8b3]">User ID</p><p className="mt-1 font-bold text-[#303844]">{selectedUser.id}</p></div><div><p className="text-[#a1a8b3]">Account type</p><p className="mt-1 font-bold text-[#303844]">{selectedUser.type}</p></div><div><p className="text-[#a1a8b3]">Status</p><div className="mt-1"><SPAD_StatusBadge label={selectedUser.status} tone={selectedUser.tone} /></div></div></div></SPAD_Panel>}
      </div>
    </SPAD_Shell>
  );
}
