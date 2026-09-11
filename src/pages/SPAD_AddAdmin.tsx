import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPAD_FilterBar, SPAD_FilterField, SPAD_Input, SPAD_Panel, SPAD_SectionHeading, SPAD_Select, SPAD_StatCard, SPAD_Field } from '../components/SPAD_Widgets';
import { SPAD_Shell } from '../components/SPAD_Shell';

interface SPAD_AddAdminDialogProps {
  onClose: () => void;
}

export function SPAD_AddAdminDialog({ onClose }: SPAD_AddAdminDialogProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <style>{`@keyframes spad-overlay-in{from{opacity:0}to{opacity:1}}@keyframes spad-dialog-in{from{opacity:0;transform:translateY(-14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#08152a]/45 px-4 pt-16 sm:pt-24 lg:justify-end lg:pr-8" style={{ animation: 'spad-overlay-in 180ms ease-out' }}>
        <div role="dialog" aria-modal="true" aria-labelledby="spad-invite-title" className="relative w-full max-w-[390px] rounded-lg border border-[#dfe4eb] bg-white shadow-[0_18px_55px_rgba(15,29,49,0.28)]" style={{ animation: 'spad-dialog-in 220ms cubic-bezier(.2,.8,.2,1)' }}>
          <div className="flex items-start justify-between border-b border-[#edf0f4] px-4 py-3"><h2 id="spad-invite-title" className="text-xs font-bold text-[#2f65ff]">Invite New Administrator</h2><button type="button" onClick={onClose} aria-label="Close invite administrator dialog" className="text-sm font-black leading-none text-[#2f65ff] transition hover:rotate-90 hover:text-[#1647c4]">×</button></div>
          {submitted ? <div className="px-4 py-10 text-center"><p className="text-xs font-bold text-[#159568]">Invitation ready to send</p><p className="mt-2 text-[9px] text-[#8e99aa]">{email || 'The new administrator'} has been prepared with the selected role.</p><button type="button" onClick={onClose} className="mt-5 rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white transition hover:bg-[#1647c4]">Done</button></div> : <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4"><SPAD_Field label="Work Email Address"><SPAD_Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@optracard.com" /></SPAD_Field><div className="grid grid-cols-2 gap-2"><SPAD_Field label="First Name"><SPAD_Input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" /></SPAD_Field><SPAD_Field label="Last Name"><SPAD_Input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" /></SPAD_Field></div><SPAD_Field label="Assign Role"><SPAD_Select required value={role} onChange={(event) => setRole(event.target.value)}><option value="">Select a role...</option><option>Super Admin</option><option>Store Admin</option><option>Dispute Team</option><option>Finance Auditor</option></SPAD_Select></SPAD_Field><SPAD_Field label="Internal Note (Optional)"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note" className="min-h-20 w-full resize-none rounded border border-[#dfe4eb] px-2.5 py-2 text-[9px] text-[#263142] outline-none placeholder:text-[#b1bac7] focus:border-[#2f65ff]" /></SPAD_Field><div className="flex justify-end gap-2 border-t border-[#edf0f4] pt-3"><button type="button" onClick={onClose} className="rounded border border-[#dfe4eb] bg-[#aab8c9] px-5 py-2 text-[9px] font-bold text-white transition hover:bg-[#8798ad]">Cancel</button><button type="submit" className="rounded bg-[#2f65ff] px-5 py-2 text-[9px] font-bold text-white transition hover:bg-[#1647c4]">Send invite</button></div></form>}
        </div>
      </div>
    </>
  );
}

export function SPAD_AddAdmin() {
  const navigate = useNavigate();
  const [backgroundQuery, setBackgroundQuery] = useState('');
  const [backgroundSearched, setBackgroundSearched] = useState(false);

  return (
    <SPAD_Shell>
      <div className="relative mx-auto min-h-[calc(100vh-104px)] max-w-[1440px]">
        <div className="space-y-4 opacity-45">
          <SPAD_SectionHeading eyebrow="07 / User & Staff Management" title="Admin & Staff Management" description="Manage platform staff accounts, role-based access, and security permissions" />
          <div className="grid gap-3 md:grid-cols-3"><SPAD_StatCard label="Total staff" value="18" detail="+2 this month" /><SPAD_StatCard label="Active sessions" value="14" detail="77.8% online" tone="teal" /><SPAD_StatCard label="2FA adoption" value="100%" detail="18 / 18 accounts" tone="purple" /></div>
          <SPAD_FilterBar><SPAD_FilterField label="Search admin"><SPAD_Input value={backgroundQuery} onChange={(event) => setBackgroundQuery(event.target.value)} placeholder="Search by name, email, or admin ID" /></SPAD_FilterField><SPAD_FilterField label="Role filter"><SPAD_Input placeholder="Type a role" /></SPAD_FilterField><SPAD_FilterField label="Status filter"><SPAD_Input placeholder="Type a status" /></SPAD_FilterField><button type="button" onClick={() => setBackgroundSearched(true)} className="self-end rounded bg-[#2f65ff] px-4 py-2 text-[9px] font-bold text-white">{backgroundSearched ? '✓ Filtered' : '⌕ Search'}</button></SPAD_FilterBar>
          <SPAD_Panel title="All administrators · 18 results" subtitle="View and manage authorized staff access."><div className="h-56" /></SPAD_Panel>
        </div>
        <SPAD_AddAdminDialog onClose={() => navigate('/superadmin/staff')} />
      </div>
    </SPAD_Shell>
  );
}
