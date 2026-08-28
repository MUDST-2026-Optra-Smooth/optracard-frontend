import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StartSelling = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasPhysicalStore, setHasPhysicalStore] = useState('have');

  // ฟังก์ชันไปขั้นตอนถัดไป และ Submit
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // โค้ดสำหรับส่งข้อมูล Back-end เมื่อกด Submit ใน Step 4 จะอยู่ตรงนี้
      console.log('Submit Data!');
      
      // หลังจาก Submit เสร็จ ให้พากลับไปที่หน้า Home ("/")
      navigate('/'); 
    }
  };

  // ฟังก์ชันย้อนกลับสำหรับปุ่ม Previous ด้านล่าง
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ฟังก์ชันสำหรับปุ่ม Back มุมซ้ายบน
  const handleTopBack = () => {
    if (currentStep === 1) {
      navigate(-1); // ถ้าอยู่ Step 1 ให้ออกจากหน้านี้ไปหน้าที่ User กดมา
    } else {
      setCurrentStep(currentStep - 1); // ถ้าอยู่ Step อื่น ให้ถอยกลับ 1 Step
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans pb-20">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* Back Button (Top Left) */}
        <button 
          onClick={handleTopBack}
          className="flex items-center text-sm font-bold text-black mb-4 hover:underline transition-opacity hover:opacity-70"
        >
          <span className="mr-2 text-lg">←</span> Back
        </button>

        {/* Page Title */}
        <h1 className="text-[32px] font-normal text-center mb-12 text-black">
          Start Selling
        </h1>

        {/* Stepper */}
        <div className="flex justify-center items-center mb-16 px-4">
          {/* Step 1: Store Detail */}
          <div className="flex flex-col items-center relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors ${currentStep >= 1 ? 'bg-[#2f65ff] text-white' : 'bg-[#e5e7eb] text-gray-700'}`}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className={`text-sm mt-3 absolute top-14 whitespace-nowrap ${currentStep >= 1 ? 'font-bold text-black' : 'font-medium text-gray-500'}`}>
              Store Detail
            </span>
          </div>

          <div className="w-12 md:w-20 h-[1px] bg-gray-400 mx-2 -mt-6"></div>

          {/* Step 2: Personal Detail */}
          <div className="flex flex-col items-center relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors ${currentStep >= 2 ? 'bg-[#2f65ff] text-white' : 'bg-[#e5e7eb] text-gray-700'}`}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className={`text-sm mt-3 absolute top-14 whitespace-nowrap ${currentStep >= 2 ? 'font-bold text-black' : 'font-medium text-gray-500'}`}>
              Personal Detail
            </span>
          </div>

          <div className="w-12 md:w-20 h-[1px] bg-gray-400 mx-2 -mt-6"></div>

          {/* Step 3: Billing Detail */}
          <div className="flex flex-col items-center relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors ${currentStep >= 3 ? 'bg-[#2f65ff] text-white' : 'bg-[#e5e7eb] text-gray-700'}`}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <span className={`text-sm mt-3 absolute top-14 whitespace-nowrap ${currentStep >= 3 ? 'font-bold text-black' : 'font-medium text-gray-500'}`}>
              Billing Detail
            </span>
          </div>

          <div className="w-12 md:w-20 h-[1px] bg-gray-400 mx-2 -mt-6"></div>

          {/* Step 4: Location */}
          <div className="flex flex-col items-center relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors ${currentStep >= 4 ? 'bg-[#2f65ff] text-white' : 'bg-[#e5e7eb] text-gray-700'}`}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <span className={`text-sm mt-3 absolute top-14 whitespace-nowrap ${currentStep >= 4 ? 'font-bold text-black' : 'font-medium text-gray-500'}`}>
              Location
            </span>
          </div>
        </div>

        {/* Dynamic Form Content */}
        <div className="max-w-xl mx-auto mt-20">
          
          {/* ----- STEP 1: Store Detail ----- */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-black">Store Detail</h2>

              <div className="mb-5">
                <label className="block text-sm text-gray-800 mb-2 font-medium">Store Name</label>
                <input 
                  type="text" 
                  placeholder="Enter Store Name" 
                  className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm text-gray-800 mb-2 font-medium">Store Detail</label>
                <textarea 
                  placeholder="Enter Detail/ Store Description" 
                  rows={4} 
                  className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition resize-none"
                ></textarea>
              </div>

              <div className="mb-8 flex items-center gap-4 text-sm">
                <span className="text-gray-500">Have a physical store?</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-black">
                  <input 
                    type="radio" 
                    name="physicalStore" 
                    checked={hasPhysicalStore === 'have'} 
                    onChange={() => setHasPhysicalStore('have')} 
                    className="w-4 h-4 accent-[#2f65ff] cursor-pointer"
                  />
                  Have
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-black">
                  <input 
                    type="radio" 
                    name="physicalStore" 
                    checked={hasPhysicalStore === 'dont_have'} 
                    onChange={() => setHasPhysicalStore('dont_have')} 
                    className="w-4 h-4 accent-[#2f65ff] cursor-pointer"
                  />
                  Don't have
                </label>
              </div>

              <div className="mb-10">
                <label className="block text-sm text-gray-500 mb-4 font-medium">
                  Upload Store Profile Picture (Optional)
                </label>
                <div className="w-[140px] h-[140px] border-[1.5px] border-dashed border-gray-400 rounded-full flex flex-col items-center justify-center bg-transparent">
                  <svg width="24" height="24" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span className="text-[11px] text-gray-500 mb-2">Drag and drop here</span>
                  <button className="border border-[#2f65ff] text-[#2f65ff] rounded-full px-4 py-1 text-xs hover:bg-blue-50 transition">
                    Select File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----- STEP 2: Personal Detail ----- */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-black">Personal Detail</h2>
              
              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Your Name" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Surname</label>
                  <input 
                    type="text" 
                    placeholder="Enter Your Surname" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter Your Email" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Tel.</label>
                  <input 
                    type="tel" 
                    placeholder="Enter Your Phone Number" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----- STEP 3: Billing Detail ----- */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-black">Bank Account</h2>
              
              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Bank</label>
                  <input 
                    type="text" 
                    placeholder="Select Bank" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Branch</label>
                  <input 
                    type="text" 
                    placeholder="Enter Bank Branch" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Account Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Account Name" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Account Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter Account Number" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>

                {/* Upload Square Box */}
                <div className="mt-2">
                  <label className="block text-sm text-gray-800 mb-2 font-medium">
                    Upload Bank Passbook Copy
                  </label>
                  <div className="w-32 h-36 border border-gray-400 rounded-md flex flex-col items-center justify-center bg-transparent">
                    <svg width="28" height="28" fill="none" stroke="black" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <button className="border border-[#2f65ff] text-[#2f65ff] rounded-full px-4 py-1 text-xs hover:bg-blue-50 transition">
                      Select File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----- STEP 4: Location ----- */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-black">Shop Address Form</h2>
              
              <div className="flex flex-col gap-5 mb-6">
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Address</label>
                  <textarea 
                    placeholder="Enter address" 
                    rows={4}
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Province</label>
                  <input 
                    type="text" 
                    placeholder="Enter province" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">District</label>
                  <input 
                    type="text" 
                    placeholder="Enter District" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Sub-district</label>
                  <input 
                    type="text" 
                    placeholder="Enter Sub-district" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2 font-medium">Postal Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter postal code" 
                    className="w-full border border-gray-400 rounded-md p-3 outline-none focus:border-[#2f65ff] transition"
                  />
                </div>
                
                {/* Checkbox with terms and conditions */}
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="acceptTerms"
                    className="w-5 h-5 border-gray-400 rounded text-[#2f65ff] focus:ring-[#2f65ff] cursor-pointer"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-800 cursor-pointer select-none">
                    I accept the Terms and Conditions and Privacy Policy
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons (Previous & Next/Submit) */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button 
                onClick={handleBack}
                className="w-1/2 border border-black text-black py-3.5 rounded-full text-lg font-medium hover:bg-gray-50 transition"
              >
                Previous
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`${currentStep > 1 ? 'w-1/2' : 'w-full'} bg-[#0b0f19] text-white py-3.5 rounded-full text-lg font-medium hover:bg-black transition shadow-sm`}
            >
              {currentStep === 4 ? 'Submit' : 'Next'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};