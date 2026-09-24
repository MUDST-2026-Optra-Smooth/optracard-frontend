import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createSuperAdminStaff } from '../api/superadmin';
import { SPAD_Shell } from '../components/SPAD_Shell';
import { SPAD_Field, SPAD_Input, SPAD_Panel, SPAD_SectionHeading } from '../components/SPAD_Widgets';

export function SPAD_AddAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createSuperAdminStaff({ username, email, password, phone, address });
      navigate('/superadmin/staff', { state: { notice: `Administrator ${username} was created.` } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the administrator.');
    } finally {
      setSaving(false);
    }
  };

  return <SPAD_Shell><div className="mx-auto max-w-2xl space-y-4">
    <SPAD_SectionHeading title="Add administrator" description="Create a real ADMIN account for the management workspace." action={<Link to="/superadmin/staff" className="cursor-pointer rounded border border-[#dfe4eb] bg-white px-3 py-2 text-[9px] font-semibold text-[#687486] hover:bg-[#f4f7fb]">← Back to staff</Link>} />
    <SPAD_Panel title="Administrator account" subtitle="This account receives the ADMIN role. Only a protected database change can create a Super Admin.">
      <form onSubmit={(event) => void submit(event)} className="space-y-4 px-5 py-5">
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><SPAD_Field label="Username"><SPAD_Input required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. ops_admin" /></SPAD_Field><SPAD_Field label="Work email"><SPAD_Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@optracard.com" /></SPAD_Field></div>
        <SPAD_Field label="Temporary password"><SPAD_Input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></SPAD_Field>
        <div className="grid gap-4 sm:grid-cols-2"><SPAD_Field label="Phone (optional)"><SPAD_Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" /></SPAD_Field><SPAD_Field label="Address (optional)"><SPAD_Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" /></SPAD_Field></div>
        <div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-4"><Link to="/superadmin/staff" className="cursor-pointer rounded border border-[#dfe4eb] px-4 py-2 text-[9px] font-semibold text-[#687486] hover:bg-[#f4f7fb]">Cancel</Link><button disabled={saving} type="submit" className="cursor-pointer rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-semibold text-white hover:bg-[#1647c4] disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Creating…' : 'Create administrator'}</button></div>
      </form>
    </SPAD_Panel>
  </div></SPAD_Shell>;
}
