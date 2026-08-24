import { useNavigate } from 'react-router-dom';

export const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faff] pb-20 pt-8 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm font-semibold text-gray-700 hover:text-black mb-8 flex items-center gap-1 transition"
        >
          ← Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2f65ff] mb-6">About Us</h1>
          <p className="text-gray-800 font-medium max-w-4xl mx-auto leading-relaxed text-lg">
            Optracard จะช่วยให้ทุกคนสามารถซื้อ-ขายประมูลการ์ดเกมได้อย่างเป็นระบบ และสร้างราคากลางให้กับตลาดการ์ดเกมในประเทศไทย <br className="hidden md:block"/>
            จากการรวบรวมประวัติการซื้อ-ขายที่เกิดขึ้นจริง เพื่อประโยชน์ของผู้เล่นและนักสะสมทุกระดับ
          </p>
        </div>

        <div className="w-full aspect-[21/9] bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
          <span className="text-gray-500 font-medium text-lg">[Banner Image Placeholder]</span>
        </div>
      </div>
    </div>
  );
};
