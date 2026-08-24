import { useNavigate } from 'react-router-dom';

const teamMembers = [
  { name: 'Raffy' },
  { name: 'Thosaporn' },
  { name: 'Phutthisan' },
  { name: 'Pannatat' },
  { name: 'Purinut' },
  { name: 'Nantanan' },
  { name: 'Saksit' },
];

export const OurTeam = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faff] pb-20 pt-8 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm font-semibold text-gray-700 hover:text-black mb-8 flex items-center gap-1 transition"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold text-[#2f65ff] text-center mb-12">Our Team</h1>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center w-28 md:w-36">
              <div className="w-full aspect-[2/3] bg-gray-300 mb-4 flex items-center justify-center shadow-sm">
                <span className="text-xs text-gray-500">[Image]</span>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">{member.name}</h3>
              
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:opacity-80">
                  IG
                </div>
                <div className="w-6 h-6 rounded border border-gray-400 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-gray-200">
                  GH
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
