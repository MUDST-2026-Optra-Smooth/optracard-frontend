import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deleteSuperAdminStaff, loadSuperAdminStaff } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatDate } from '../components/SPAD_DataState';
import { SPAD_DeleteAccountDialog } from '../components/SPAD_DeleteAccountDialog';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import { useAuth } from '../context/AuthContext';
import type { SuperAdminStaff } from '../types/superadmin';

export function SPAD_Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<SuperAdminStaff[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [deletingStaff, setDeletingStaff] = useState<SuperAdminStaff | null>(null);
  const load = useCallback(async () => {
    setError('');
    try { setStaff(await loadSuperAdminStaff()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load staff accounts.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => (staff ?? []).filter((member) => `${member.username} ${member.email} ${member.role}`.toLowerCase().includes(query.trim().toLowerCase())), [staff, query]);
  const superAdmins = (staff ?? []).filter((member) => member.role === 'SUPER_ADMIN').length;
  const admins = (staff ?? []).filter((member) => member.role === 'ADMIN').length;
  const removeStaff = async (confirmation: string) => {
    if (!deletingStaff) return;
    await deleteSuperAdminStaff(deletingStaff.id, confirmation);
    setStaff((current) => current?.filter((member) => member.id !== deletingStaff.id) ?? null);
    setDeletingStaff(null);
  };

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading
      title="Manage Staff"
      description="Administrative accounts with access to the management workspaces."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#485363] hover:bg-[#f4f7fb]"
            title="Refresh staff from live database"
          >
            <RefreshCcw className="h-3 w-3 text-[#2f65ff]" />
            Refresh
          </button>
          <Link to="/superadmin/users" className="cursor-pointer rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#687486] hover:bg-[#f4f7fb]">
            View users
          </Link>
          {staff && <SPAD_ExportButton label="Export staff" fileName="optracard-staff.csv" rows={visible.map((member) => ({ id: member.id, username: member.username, email: member.email, role: member.role, phone: member.phone ?? '', created_at: member.createdAt ?? '' }))} />}
          <Link to="/superadmin/staff/add" className="cursor-pointer rounded bg-[#2f65ff] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#1647c4]">
            + Add admin
          </Link>
        </div>
      }
    />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !staff ? <SPAD_Loading /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Staff accounts" value={String(staff.length)} /><SPAD_StatCard label="Super administrators" value={String(superAdmins)} tone="purple" /><SPAD_StatCard label="Administrators" value={String(admins)} tone="teal" /></div>
      <SPAD_FilterBar><SPAD_FilterField label="Search staff"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, or role" /></SPAD_FilterField><div className="self-end text-[9px] text-[#8e99aa]">{visible.length} matching staff accounts</div></SPAD_FilterBar>
      <SPAD_Panel title={`Staff · ${visible.length} results`} subtitle="New accounts created here are standard ADMIN accounts. The current user and the last Super Admin are protected from deletion."><div className="overflow-x-auto"><table className="w-full min-w-[870px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">Staff member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{visible.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[#8e99aa]">No staff accounts match the search.</td></tr> : visible.map((member) => { const isCurrentUser = member.id === user?.userId; return <tr key={member.id} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><p className="font-bold text-[#303844]">{member.username}</p><p className="mt-1 text-[8px] text-[#8e99aa]">Staff ID: {member.id}</p></td><td className="px-4 py-3"><SPAD_StatusBadge label={member.role} tone={member.role === 'SUPER_ADMIN' ? 'blue' : 'neutral'} /></td><td className="px-4 py-3"><p>{member.email}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{member.phone ?? 'No phone recorded'}</p></td><td className="px-4 py-3 text-[#687486]">{formatDate(member.createdAt)}</td><td className="px-4 py-3 text-right"><button type="button" disabled={isCurrentUser} onClick={() => setDeletingStaff(member)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300" aria-label={isCurrentUser ? 'You cannot delete your own account' : `Delete ${member.username}`} title={isCurrentUser ? 'You cannot delete your own account' : 'Delete staff'}><Trash2 size={14} /></button></td></tr>; })}</tbody></table></div></SPAD_Panel>
    </>}
    {deletingStaff && <SPAD_DeleteAccountDialog accountName={deletingStaff.username} accountType="staff" onClose={() => setDeletingStaff(null)} onConfirm={removeStaff} />}
  </div></SPAD_Shell>;
}
