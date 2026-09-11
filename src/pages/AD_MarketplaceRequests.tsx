import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X, FileArchive, CheckCircle2, Clock, ChevronRight, XCircle, ArrowLeft } from 'lucide-react';
import ADsidebar from '../components/ADsidebar';

export const AD_MarketplaceRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const requestData = {
    id: id || "MR-1049",
    title: "Charizard ex",
    submitter: "Aria Moon",
    date: "22 Aug 2026 at 14:30 PM",
    status: "Pending",
    description: "A highly sought-after Charizard ex card from the Scarlet & Violet—151 set. This listing was submitted for review with high-resolution images.",
    details: {
      "Request ID": id || "MR-1049",
      "Listing ID": "LST-99210",
      "Creator": "Aria Moon",
      "Category": "Pokemon TCG",
      "Collection": "Scarlet & Violet—151",
      "Card Code": "006/165",
      "Card Type": "Stage 2 Pokémon",
      "Rarity": "Double Rare",
      "Language": "English",
      "Condition": "Near Mint",
      "Price": "฿12,900",
      "Quantity": "2 items"
    },
    longDescription: "Authentic Charizard ex card in near-mint condition. Stored in a protective sleeve and magnetic top loader. The listing includes clear front and back images for buyer verification. Centering looks perfect.",
    assetName: "charizard-ex-hires.zip",
    assetDetails: "2 images · 4.1 MB · Uploaded 22 Aug 2026",
    image: "https://images.pokemontcg.io/sv3pt5/6_hires.png" 
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-slate-800">
      <ADsidebar currentTab="marketplace-requests" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0f172a] shrink-0 border-b border-slate-800" />

        <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto overflow-y-auto space-y-6">
          <button 
            onClick={() => navigate('/admin/marketplace/requests')}
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Requests
          </button>

          <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 gap-2">
                  <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/admin/marketplace/requests')}>
              Marketplace requests
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Review request</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">Review listing request</h1>
                
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  requestData.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  requestData.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {requestData.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                  {requestData.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {requestData.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                  {requestData.status === 'Pending' ? 'Pending review' : requestData.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Check the listing information and attached assets before publishing it to Marketplace.
              </p>
            </div>
            
            {requestData.status === 'Pending' && (
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-red-200 text-red-500 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm cursor-pointer">
                  <X className="w-4 h-4 stroke-[3]" />
                  Reject
                </button>
                <button className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Approve listing
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
                <div className="relative shrink-0">
                  <img 
                    src={requestData.image} 
                    alt={requestData.title}
                    className="w-32 h-auto rounded-xl shadow-md border-2 border-white ring-1 ring-slate-100 object-cover"
                  />
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listing Submission</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{requestData.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xl">
                    {requestData.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[11px] font-bold">Complete submission</span>
                    <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-bold">{requestData.details.Rarity}</span>
                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[11px] font-bold">{requestData.details.Language}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">AM</div>
                    Submitted by <span className="font-bold text-slate-700">{requestData.submitter}</span> · {requestData.date}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 mb-8" />

              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-slate-900">Listing information</h3>
                  <span className="text-xs font-medium text-slate-400">All fields are verified on the record</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                  {Object.entries(requestData.details).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[11px] font-medium text-slate-400 mb-1">{key}</div>
                      <div className="text-sm font-bold text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100 mb-8" />

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Description</h3>
                  <span className="text-xs font-medium text-slate-400">Creator provided copy</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100">
                  {requestData.longDescription}
                </p>
              </div>

              <hr className="border-slate-100 mb-8" />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Submitted assets</h3>
                  <span className="text-xs font-medium text-slate-400">2 files attached</span>
                </div>
                <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-red-300 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <FileArchive className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">{requestData.assetName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{requestData.assetDetails}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-fit sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Review checklist</h3>
              <p className="text-xs text-slate-400 mb-6">
                Confirm the listing meets marketplace requirements before approving.
              </p>

              <div className="bg-slate-50 rounded-xl p-8 flex justify-center mb-6 border border-slate-100 overflow-hidden">
                <img 
                  src={requestData.image} 
                  alt={requestData.title}
                  className="w-36 h-auto rounded-xl shadow-lg border-2 border-white transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 object-cover"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Submission checks</h4>
                  <span className="text-xs font-bold text-emerald-500">5/5 complete</span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Required fields are complete",
                    "Images are clear and readable",
                    "Collection and card number verified",
                    "Price and quantity are valid",
                    "No duplicate listing found"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${requestData.status === 'Rejected' ? 'text-slate-300' : 'text-emerald-500'}`} strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {requestData.status === 'Pending' && (
                <>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                    <h5 className="text-xs font-bold text-amber-800 mb-1">Admin note</h5>
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                      Approving this request will publish the listing immediately and notify the creator.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 flex justify-center items-center gap-2 bg-white border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm cursor-pointer">
                      <X className="w-4 h-4 stroke-[3]" /> Reject
                    </button>
                    <button className="flex-[1.5] flex justify-center items-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer">
                      <Check className="w-4 h-4 stroke-[3]" /> Approve listing
                    </button>
                  </div>
                </>
              )}

              {requestData.status === 'Approved' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mt-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h5 className="text-sm font-bold text-emerald-800 mb-1">Listing Approved</h5>
                  <p className="text-xs text-emerald-700/80 leading-relaxed">
                    This product is now live on the marketplace.
                  </p>
                </div>
              )}

              {requestData.status === 'Rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-4 text-center">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h5 className="text-sm font-bold text-red-800 mb-1">Request Rejected</h5>
                  <p className="text-xs text-red-700/80 leading-relaxed">
                    This listing did not meet the marketplace guidelines and was returned to the seller.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AD_MarketplaceRequestDetail;
