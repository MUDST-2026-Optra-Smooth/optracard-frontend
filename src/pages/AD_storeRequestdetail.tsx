import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  Check
} from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

export const ADstoreRequestdetail: React.FC = () => {
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState({
    legalName: true,
    ownerIdentity: true,
    businessAddress: false,
    noDuplicate: false,
  });

  const [reviewerNote, setReviewerNote] = useState('');

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ADsidebar currentTab="manage-requests" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0f172a] shrink-0 border-b border-slate-800" />

        <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto overflow-y-auto space-y-6">
          {/* Top Back Navigation Link */}
          <div>
            <button
              type="button"
              onClick={() => navigate('/admin/store-requests')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition"
            >
              <ArrowLeft size={14} />
              <span>Back to store requests</span>
            </button>
          </div>

          {/* Store Request Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                PC
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">Pokemon Center TH</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                    • Pending verification
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-200/60">
                    • New store
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Request REQ-20250819-0018 · Submitted by Narin Kittisak · 19 Aug 2025, 14:08
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                SLA due: <strong className="text-slate-700">20 Aug 2025</strong>
              </span>
              <button
                type="button"
                onClick={() => navigate('/admin/store-requests')}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Store Information Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Store information</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Submitted profile details for verification</p>
                  </div>
                  <span className="text-[11px] text-slate-400">Last updated: 19 Aug 2025, 14:08</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Legal store name</span>
                    <span className="font-semibold text-slate-800">Pokemon Center Thailand Co., Ltd.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Store type</span>
                    <span className="font-semibold text-slate-800">Professional store - Online only</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Owner / representative</span>
                    <span className="font-semibold text-slate-800">Narin Kittisak</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Registration number</span>
                    <span className="font-semibold text-slate-800">0105568123456</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Email</span>
                    <span className="font-semibold text-blue-600">narin@pokemoncenter-th.example</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Phone</span>
                    <span className="font-semibold text-slate-800">+66 81 234 5678</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-1">Business address</span>
                    <span className="font-semibold text-slate-800">88 Sukhumvit Road, Khlong Toei, Bangkok 10110</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-1">Primary games</span>
                    <span className="font-semibold text-slate-800">Pokémon · One Piece · Yu-Gi-Oh!</span>
                  </div>
                </div>
              </div>

              {/* Submitted Documents Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Submitted documents</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Documents uploaded with this request</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                    • 4/4 complete
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Company registration certificate.pdf', size: '2.4 MB', time: '19 Aug 2025, 13:58' },
                    { name: 'Business owner identification.pdf', size: '1.1 MB', time: '19 Aug 2025, 13:57' },
                    { name: 'Proof of business address.pdf', size: '890 KB', time: '19 Aug 2025, 13:58' },
                    { name: 'Storefront ownership declaration.pdf', size: '745 KB', time: '19 Aug 2025, 13:57' },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">PDF · {doc.size} · Uploaded {doc.time}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer shrink-0 ml-3"
                      >
                        <span>Open preview</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Verification Checklist Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Verification checklist</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Complete these checks before approving</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {checkedCount}/4 reviewed
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.legalName}
                      onChange={() => handleToggleChecklist('legalName')}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Legal name matches documents</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Confirm the submitted legal name is consistent across the registration and identity documents
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.ownerIdentity}
                      onChange={() => handleToggleChecklist('ownerIdentity')}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Owner identity is valid</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Check that the representative's identity document is clear and not expired
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.businessAddress}
                      onChange={() => handleToggleChecklist('businessAddress')}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Business address is complete</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Verify that the address is present and readable on the proof of address
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.noDuplicate}
                      onChange={() => handleToggleChecklist('noDuplicate')}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Store does not duplicate an existing account</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Search the store directory for matching legal names or owner identities
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Reviewer Note Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="pb-3 border-b border-slate-100 mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Reviewer note</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visible to the applicant when approved / requested changes</p>
                </div>
                <textarea
                  rows={3}
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="Add a note for approval or requested changes..."
                  className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Request Timeline Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h2 className="text-sm font-bold text-slate-900">Request timeline</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Activity on this verification request</p>
                </div>

                <div className="space-y-4 text-xs relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-900">Request submitted</span>
                        <span className="text-slate-400">19 Aug · 14:08</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Narin Kittisak submitted a new store verification request.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-amber-600">Awaiting review</span>
                        <span className="text-slate-400">19 Aug · 14:09</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        The request is ready for Super Admin verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Ready to make a decision?</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Approving this request makes the store eligible to publish products on the marketplace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Request changes
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Reject request
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Approve store</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ADstoreRequestdetail;
