import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteSuperAdminUser, loadSuperAdminUsers } from '../api/superadmin';
import { SPAD_Error, SPAD_Loading, formatDate, statusTone } from '../components/SPAD_DataState';
import { SPAD_DeleteAccountDialog } from '../components/SPAD_DeleteAccountDialog';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_ExportButton, SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_StatCard, SPAD_StatusBadge } from '../components/SPAD_Widgets';
import type { SuperAdminUser } from '../types/superadmin';

export function SPAD_Users() {
  const [users, setUsers] = useState<SuperAdminUser[] | null>(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');
  const [error, setError] = useState('');
  const [deletingUser, setDeletingUser] = useState<SuperAdminUser | null>(null);
  const load = useCallback(async () => {
    setError('');
    try { setUsers(await loadSuperAdminUsers()); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load platform users.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => (users ?? []).filter((user) => {
    const text = `${user.username} ${user.email} ${user.phone ?? ''} ${user.storeName ?? ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (role === 'ALL' || user.role === role);
  }), [users, query, role]);
  const sellers = (users ?? []).filter((user) => user.role === 'SELLER').length;
  const buyers = (users ?? []).filter((user) => user.role === 'USER').length;
  const roleOptions = [...new Set((users ?? []).map((user) => user.role))].sort();
  const removeUser = async (confirmation: string) => {
    if (!deletingUser) return;
    await deleteSuperAdminUser(deletingUser.id, confirmation);
    setUsers((current) => current?.filter((user) => user.id !== deletingUser.id) ?? null);
    setDeletingUser(null);
  };

  return <SPAD_Shell><div className="mx-auto max-w-[1440px] space-y-4">
    <SPAD_SectionHeading title="Manage User" description="Customer and seller accounts from the platform database. Staff accounts are managed separately." action={users ? <SPAD_ExportButton label="Export users" fileName="optracard-users.csv" rows={visible.map((user) => ({ id: user.id, username: user.username, email: user.email, role: user.role, phone: user.phone ?? '', store: user.storeName ?? '', store_status: user.storeStatus ?? '', joined_at: user.createdAt ?? '' }))} /> : undefined} />
    {error ? <SPAD_Error message={error} onRetry={() => void load()} /> : !users ? <SPAD_Loading /> : <>
      <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Platform users" value={String(users.length)} /><SPAD_StatCard label="Buyer accounts" value={String(buyers)} tone="blue" /><SPAD_StatCard label="Seller accounts" value={String(sellers)} detail="Based on their current account role" tone="teal" /></div>
      <SPAD_FilterBar><SPAD_FilterField label="Search users"><SPAD_Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, phone, or store" /></SPAD_FilterField><SPAD_FilterField label="Account role"><select value={role} onChange={(event) => setRole(event.target.value)} className="h-8 w-full rounded border border-[#dfe4eb] bg-white px-2.5 text-[9px] text-[#687486]"><option value="ALL">All roles</option>{roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></SPAD_FilterField><div className="self-end text-[9px] text-[#8e99aa]">{visible.length} matching users</div></SPAD_FilterBar>
      <SPAD_Panel title={`Users · ${visible.length} results`} subtitle="Only persisted profile fields are displayed; passwords are never returned by the API."><div className="overflow-x-auto"><table className="w-full min-w-[1020px] text-left"><thead className="bg-[#f4f7fb] text-[8px] uppercase tracking-wide text-[#687486]"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#edf0f4] text-[10px]">{visible.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-[#8e99aa]">No users match the selected filters.</td></tr> : visible.map((user) => <tr key={user.id} className="hover:bg-[#fafbfd]"><td className="px-4 py-3"><p className="font-bold text-[#303844]">{user.username}</p><p className="mt-1 text-[8px] text-[#8e99aa]">User ID: {user.id}</p></td><td className="px-4 py-3"><p className="text-[#303844]">{user.email}</p><p className="mt-1 text-[8px] text-[#8e99aa]">{user.phone ?? 'No phone recorded'}</p></td><td className="px-4 py-3"><SPAD_StatusBadge label={user.role} tone={user.role === 'SELLER' ? 'blue' : 'neutral'} /></td><td className="px-4 py-3">{user.storeName ? <><p className="font-medium text-[#303844]">{user.storeName}</p><div className="mt-1"><SPAD_StatusBadge label={user.storeStatus ?? 'Unknown'} tone={statusTone(user.storeStatus)} /></div></> : <span className="text-[#8e99aa]">No store</span>}</td><td className="px-4 py-3 text-[#687486]">{formatDate(user.createdAt)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => setDeletingUser(user)} className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${user.username}`} title="Delete user"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div></SPAD_Panel>
    </>}
    {deletingUser && <SPAD_DeleteAccountDialog accountName={deletingUser.username} accountType="user" includesStoreData={deletingUser.storeId !== null} onClose={() => setDeletingUser(null)} onConfirm={removeUser} />}
  </div></SPAD_Shell>;
}
