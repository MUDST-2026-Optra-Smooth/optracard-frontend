import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type StoreForm = {
  storeName: string; storeDescription: string; physicalStore: boolean;
  ownerFirstName: string; ownerLastName: string; ownerEmail: string; ownerPhone: string;
  bankName: string; bankBranch: string; bankAccountName: string; bankAccountNumber: string;
  storeAddress: string; province: string; district: string; subdistrict: string; postalCode: string;
  storeProfileImage: string; bankPassbookImage: string; termsAccepted: boolean;
};

const emptyForm: StoreForm = {
  storeName: '', storeDescription: '', physicalStore: true,
  ownerFirstName: '', ownerLastName: '', ownerEmail: '', ownerPhone: '',
  bankName: '', bankBranch: '', bankAccountName: '', bankAccountNumber: '',
  storeAddress: '', province: '', district: '', subdistrict: '', postalCode: '',
  storeProfileImage: '', bankPassbookImage: '', termsAccepted: false,
};

const StepTitle = ({ step, current, title }: { step: number; current: number; title: string }) => (
  <div className="flex flex-col items-center relative">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${current >= step ? 'bg-[#2f65ff] text-white' : 'bg-gray-200 text-gray-500'}`}><span className="font-bold">{step}</span></div>
    <span className={`text-xs mt-2 absolute top-12 whitespace-nowrap ${current >= step ? 'font-bold text-black' : 'text-gray-500'}`}>{title}</span>
  </div>
);

export const StartSelling = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<StoreForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadApplication = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }
      try {
        const response = await fetch(`${API_BASE_URL}/api/stores/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok && response.status !== 204) {
          const data = await response.json();
          setForm((previous) => ({
            ...previous,
            storeName: data.storeName ?? '', storeDescription: data.storeDescription ?? '', physicalStore: Boolean(data.physicalStore),
            ownerFirstName: data.ownerFirstName ?? '', ownerLastName: data.ownerLastName ?? '', ownerEmail: data.ownerEmail ?? '', ownerPhone: data.ownerPhone ?? '',
            bankName: data.bankName ?? '', bankBranch: data.bankBranch ?? '', bankAccountName: data.bankAccountName ?? '', bankAccountNumber: data.bankAccountNumber ?? '',
            storeAddress: data.storeAddress ?? '', province: data.province ?? '', district: data.district ?? '', subdistrict: data.subdistrict ?? '', postalCode: data.postalCode ?? '',
            storeProfileImage: data.storeProfileImage ?? '', bankPassbookImage: data.bankPassbookImage ?? '', termsAccepted: Boolean(data.termsAccepted),
          }));
        }
      } catch { setMessage({ type: 'error', text: 'Unable to load your seller application.' }); }
      finally { setIsLoading(false); }
    };
    void loadApplication();
  }, []);

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const readFile = (name: 'storeProfileImage' | 'bankPassbookImage', file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Each image must be smaller than 5 MB.' }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((previous) => ({ ...previous, [name]: String(reader.result ?? '') }));
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const requiredByStep: Record<number, Array<keyof StoreForm>> = {
      1: ['storeName', 'storeDescription'], 2: ['ownerFirstName', 'ownerLastName', 'ownerEmail', 'ownerPhone'],
      3: ['bankName', 'bankBranch', 'bankAccountName', 'bankAccountNumber'], 4: ['storeAddress', 'province', 'district', 'subdistrict', 'postalCode'],
    };
    if (requiredByStep[currentStep].some((key) => !String(form[key] ?? '').trim())) { setMessage({ type: 'error', text: 'Please complete all required fields before continuing.' }); return false; }
    if (currentStep === 4 && !form.termsAccepted) { setMessage({ type: 'error', text: 'Please accept the Terms and Conditions.' }); return false; }
    setMessage(null); return true;
  };

  const handleNext = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep()) return;
    if (currentStep < 4) { setCurrentStep((step) => step + 1); return; }
    const token = localStorage.getItem('token');
    if (!token || !user) { navigate('/login'); return; }
    setIsSaving(true); setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/my`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || 'Could not submit your seller application.');
      setMessage({ type: 'success', text: 'Your shop information was saved. Status: Pending admin approval.' });
      window.setTimeout(() => navigate('/'), 1800);
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not save your application.' }); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading your seller application…</div>;
  const inputClass = 'w-full border border-gray-300 rounded-md p-3 outline-none focus:border-[#2f65ff] transition';
  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-20"><div className="max-w-5xl mx-auto px-6 pt-10">
      <button type="button" onClick={() => currentStep === 1 ? navigate(-1) : setCurrentStep((step) => step - 1)} className="text-sm font-bold text-black mb-4 hover:underline">← Back</button>
      <h1 className="text-[32px] font-normal text-center mb-12 text-black">My Shop</h1>
      <div className="flex justify-center items-center mb-16 px-4"><StepTitle step={1} current={currentStep} title="Store Detail" /><div className="w-12 md:w-20 h-px bg-gray-300 mx-2 -mt-6" /><StepTitle step={2} current={currentStep} title="Personal Detail" /><div className="w-12 md:w-20 h-px bg-gray-300 mx-2 -mt-6" /><StepTitle step={3} current={currentStep} title="Billing Detail" /><div className="w-12 md:w-20 h-px bg-gray-300 mx-2 -mt-6" /><StepTitle step={4} current={currentStep} title="Location" /></div>
      <form onSubmit={handleNext} className="max-w-xl mx-auto mt-20">
        {currentStep === 1 && <div className="space-y-5"><h2 className="text-xl font-bold mb-6">Store Detail</h2><label className="block text-sm font-medium">Store Name<input name="storeName" value={form.storeName} onChange={update} className={inputClass} placeholder="Enter Store Name" required /></label><label className="block text-sm font-medium">Store Detail<textarea name="storeDescription" value={form.storeDescription} onChange={update} rows={4} className={inputClass} placeholder="Enter Detail / Store Description" required /></label><div className="flex items-center gap-4 text-sm"><span className="text-gray-500">Have a physical store?</span><label className="flex items-center gap-1.5"><input type="radio" checked={form.physicalStore} onChange={() => setForm((p) => ({ ...p, physicalStore: true }))} />Have</label><label className="flex items-center gap-1.5"><input type="radio" checked={!form.physicalStore} onChange={() => setForm((p) => ({ ...p, physicalStore: false }))} />Don't have</label></div><label className="block text-sm font-medium">Store Profile Picture (optional)<input type="file" accept="image/*" onChange={(e) => readFile('storeProfileImage', e.target.files?.[0])} className="mt-2 block w-full text-sm" /></label></div>}
        {currentStep === 2 && <div className="space-y-5"><h2 className="text-xl font-bold mb-6">Personal Detail</h2><label className="block text-sm font-medium">Name<input name="ownerFirstName" value={form.ownerFirstName} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Surname<input name="ownerLastName" value={form.ownerLastName} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Email<input type="email" name="ownerEmail" value={form.ownerEmail} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Tel.<input type="tel" name="ownerPhone" value={form.ownerPhone} onChange={update} className={inputClass} required /></label></div>}
        {currentStep === 3 && <div className="space-y-5"><h2 className="text-xl font-bold mb-6">Bank Account</h2><label className="block text-sm font-medium">Bank<input name="bankName" value={form.bankName} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Branch<input name="bankBranch" value={form.bankBranch} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Account Name<input name="bankAccountName" value={form.bankAccountName} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Account Number<input name="bankAccountNumber" value={form.bankAccountNumber} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Bank Passbook Copy (optional)<input type="file" accept="image/*,.pdf" onChange={(e) => readFile('bankPassbookImage', e.target.files?.[0])} className="mt-2 block w-full text-sm" /></label></div>}
        {currentStep === 4 && <div className="space-y-5"><h2 className="text-xl font-bold mb-6">Shop Address</h2><label className="block text-sm font-medium">Address<textarea name="storeAddress" value={form.storeAddress} onChange={update} rows={4} className={inputClass} required /></label><label className="block text-sm font-medium">Province<input name="province" value={form.province} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">District<input name="district" value={form.district} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Sub-district<input name="subdistrict" value={form.subdistrict} onChange={update} className={inputClass} required /></label><label className="block text-sm font-medium">Postal Code<input name="postalCode" value={form.postalCode} onChange={update} className={inputClass} required /></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm((p) => ({ ...p, termsAccepted: e.target.checked }))} className="w-5 h-5" />I accept the Terms and Conditions and Privacy Policy</label></div>}
        {message && <p role="status" className={`mt-5 rounded-md px-3 py-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>}
        <div className="flex gap-4 mt-8">{currentStep > 1 && <button type="button" onClick={() => setCurrentStep((step) => step - 1)} className="w-1/2 border border-black text-black py-3.5 rounded-full">Previous</button>}<button type="submit" disabled={isSaving} className={`${currentStep > 1 ? 'w-1/2' : 'w-full'} bg-[#0b0f19] disabled:opacity-50 text-white py-3.5 rounded-full font-medium`}>{isSaving ? 'Saving…' : currentStep === 4 ? 'Submit for approval' : 'Next'}</button></div>
      </form>
    </div></div>
  );
};
