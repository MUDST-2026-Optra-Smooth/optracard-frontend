import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { SPAD_AddAdminDialog } from './SPAD_AddAdmin';
import { SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Pagination, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

const staff = [
  { id: 'ADM-00102', name: 'Thanawat K.', email: 'thanawat.k@optracard.com', role: 'Super Admin', modules: 'All Modules', active: 'Today\n14:12', status: 'Active', tone: 'green' as const, color: 'bg-[#f08a35] text-white', initials: 'TK' },
  { id: 'ADM-00105', name: 'Ploy S.', email: 'ploy.s@optracard.com', role: 'Store Admin', modules: 'Catalog, Stores', active: 'Today\n13:48', status: 'Active', tone: 'green' as const, color: 'bg-[#4e79d9] text-white', initials: 'PL' },
  { id: 'ADM-00112', name: 'Meta TCG Support', email: 'support@metatcg.com', role: 'Dispute Team', modules: 'Trades, Disputes', active: 'Yesterday\n18:09', status: 'Active', tone: 'green' as const, color: 'bg-[#7453bd] text-white', initials: 'MT' },
  { id: 'ADM-00118', name: 'Mook J.', email: 'mook.j@optracard.com', role: 'Finance Auditor', modules: 'Payouts, Fees', active: 'Yesterday\n17:42', status: 'Active', tone: 'green' as const, color: 'bg-[#32a487] text-white', initials: 'MK' },
  { id: 'ADM-00124', name: 'Pawarit W.', email: 'pawarit.w@optracard.com', role: 'Store Admin', modules: 'Catalog, Stores', active: '18 Aug\n21:05', status: 'Active', tone: 'green' as const, color: 'bg-[#db5870] text-white', initials: 'PW' },
];

export function SPAD_Staff() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<(typeof staff)[number] | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const visibleStaff = useMemo(() => staff.filter((member) => `${member.name} ${member.email} ${member.id}`.toLowerCase().includes(appliedQuery.toLowerCase()) && (!role || member.role.toLowerCase().includes(role.toLowerCase())) && (!status || member.status.toLowerCase().includes(status.toLowerCase()))), [appliedQuery, role, status]);

  return (
    <SPAD_Shell>
      <div className="mx-auto max-w-[1440px] space-y-4">
        <SPAD_SectionHeading eyebrow="07 / User & Staff Management / Admin & Staff Management" title="Admin & Staff Management" description="Manage platform staff accounts, role-based access, and security permissions" action={<><Link to="/superadmin/users" className="rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[8px] font-bold text-[#687486]">View Platform Users →</Link><button type="button" onClick={() => setShowAddAdmin(true)} className="rounded bg-[#2f65ff] px-3 py-2 text-[8px] font-bold text-white">+ New Admin</button></>} />

        <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Total staff" value="18" detail="+2 this month" /><SPAD_StatCard label="Active sessions" value="14" detail="77.8% online" tone="teal" /><SPAD_StatCard label="2FA adoption" value="100%" detail="18 / 18 accounts" tone="purple" /></div>

        <SPAD_FilterBar>
          <SPAD_FilterField label="Search admin"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or admin ID" /></SPAD_FilterField>
          <SPAD_FilterField label="Role filter"><SPAD_Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Type a role" /></SPAD_FilterField>
          <SPAD_FilterField label="Status filter"><SPAD_Input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Type a status" /></SPAD_FilterField>
          <button type="button" onClick={() => setAppliedQuery(query.trim())} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white hover:bg-[#1647c4]">⌕ Search</button>
        </SPAD_FilterBar>

        <SPAD_Panel title="All administrators · 18 results" subtitle="View and manage authorized staff access to the platform." action={<span className="text-[8px] text-[#a1a8b3]">Showing first 5</span>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-[#edf0f4] bg-[#f4f7fb] text-[8px] font-bold text-[#687486]"><tr><th className="px-3 py-2.5">Admin Name / Email</th><th className="px-3 py-2.5">Admin ID</th><th className="px-3 py-2.5">Assigned Role</th><th className="px-3 py-2.5">Module Access</th><th className="px-3 py-2.5 text-right">Last Active</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5" /></tr></thead><tbody className="divide-y divide-[#f0f2f5] text-[9px]">{visibleStaff.map((member) => <tr key={member.id} className="hover:bg-[#fafbfd]"><td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className={`flex h-6 w-6 items-center justify-center rounded text-[7px] font-black ${member.color}`}>{member.initials}</span><span><span className="block font-bold text-[#303844]">{member.name}</span><span className="text-[8px] text-[#a1a8b3]">{member.email}</span></span></div></td><td className="px-3 py-2.5 font-bold text-[#303844]">{member.id}</td><td className="px-3 py-2.5 text-[#687486]">{member.role}</td><td className="px-3 py-2.5 font-semibold text-[#303844]">{member.modules}</td><td className="whitespace-pre-line px-3 py-2.5 text-right text-[8px] text-[#687486]">{member.active}</td><td className="px-3 py-2.5"><SPAD_StatusBadge label={member.status} tone={member.tone} /></td><td className="px-3 py-2.5 text-right"><button type="button" onClick={() => setSelectedStaff(member)} aria-label={`Manage ${member.name}`} title="View administrator" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe3ee] bg-white text-[#2f65ff] shadow-[0_1px_2px_rgba(27,39,63,0.04)] transition hover:border-[#2f65ff] hover:bg-[#edf4ff]"><Eye size={12} /></button></td></tr>)}</tbody></table></div>
          <SPAD_Pagination count={`Showing ${visibleStaff.length ? '1–5' : '0'} of 18 admins`} />
        </SPAD_Panel>
        {selectedStaff && <SPAD_Panel title={selectedStaff.name} subtitle="Read-only administrator profile" action={<button type="button" onClick={() => setSelectedStaff(null)} className="text-[9px] font-bold text-[#2f65ff]">Close</button>}><div className="grid gap-3 px-4 py-4 text-[9px] sm:grid-cols-4"><div><p className="text-[#a1a8b3]">Email</p><p className="mt-1 font-bold text-[#303844]">{selectedStaff.email}</p></div><div><p className="text-[#a1a8b3]">Admin ID</p><p className="mt-1 font-bold text-[#303844]">{selectedStaff.id}</p></div><div><p className="text-[#a1a8b3]">Role</p><p className="mt-1 font-bold text-[#303844]">{selectedStaff.role}</p></div><div><p className="text-[#a1a8b3]">Module access</p><p className="mt-1 font-bold text-[#303844]">{selectedStaff.modules}</p></div></div></SPAD_Panel>}
        {showAddAdmin && <SPAD_AddAdminDialog onClose={() => setShowAddAdmin(false)} />}
      </div>
    </SPAD_Shell>
  );
}
