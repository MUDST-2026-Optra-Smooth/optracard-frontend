import { useEffect, useState } from 'react';

interface SPAD_DeleteAccountDialogProps {
  accountName: string;
  accountType: 'user' | 'staff';
  includesStoreData?: boolean;
  onClose: () => void;
  onConfirm: (confirmation: string) => Promise<void>;
}

/** A deliberate two-stage guard before an irreversible account deletion. */
export function SPAD_DeleteAccountDialog({ accountName, accountType, includesStoreData = false, onClose, onConfirm }: SPAD_DeleteAccountDialogProps) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setStage(1);
    setConfirmation('');
    setError('');
  }, [accountName, accountType]);

  const deleteAccount = async () => {
    if (confirmation !== 'DELETE') return;
    setDeleting(true);
    setError('');
    try {
      await onConfirm(confirmation);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete this account.');
      setDeleting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08152a]/50 px-4" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-xl border border-[#dfe4eb] bg-white shadow-[0_20px_60px_rgba(8,21,42,0.35)]">
      <div className="border-b border-[#edf0f4] px-5 py-4"><p className="text-xs font-bold text-red-600">Permanent action</p><h2 id="delete-account-title" className="mt-1 text-lg font-black text-[#202735]">Delete {accountType} account?</h2></div>
      {stage === 1 ? <div className="space-y-4 px-5 py-5 text-sm text-[#586476]">
        <p>You are about to permanently delete <strong className="text-[#202735]">{accountName}</strong>. This cannot be undone.</p>
        {includesStoreData && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">This Seller account owns a marketplace store. Its listings and store profile will also be removed. Transaction history remains for audit purposes.</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[#dfe4eb] px-4 py-2 text-xs font-semibold text-[#687486]">Cancel</button><button type="button" onClick={() => setStage(2)} className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">Continue</button></div>
      </div> : <div className="space-y-4 px-5 py-5 text-sm text-[#586476]">
        <p>Second confirmation: type <strong className="font-mono text-red-600">DELETE</strong> to permanently remove <strong className="text-[#202735]">{accountName}</strong>.</p>
        <input autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type DELETE" className="h-10 w-full rounded border border-[#dfe4eb] px-3 text-sm text-[#202735] outline-none focus:border-red-500" />
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="flex justify-between gap-2"><button type="button" disabled={deleting} onClick={() => { setStage(1); setConfirmation(''); setError(''); }} className="rounded border border-[#dfe4eb] px-4 py-2 text-xs font-semibold text-[#687486] disabled:opacity-50">Back</button><button type="button" disabled={confirmation !== 'DELETE' || deleting} onClick={() => void deleteAccount()} className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete permanently'}</button></div>
      </div>}
    </section>
  </div>;
}
