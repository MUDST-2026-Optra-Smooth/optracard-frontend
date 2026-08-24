import { useNavigate } from 'react-router-dom';
import { FaGithub, FaInstagram } from 'react-icons/fa';

import raffyImg from '../assets/raffy.jpg';
import thosapornImg from '../assets/kendo.jpg';
import phutthisanImg from '../assets/phutthisan.jpg';
import pannatatImg from '../assets/Ming.jpg';
import purinutImg from '../assets/optra.png';
import nantananImg from '../assets/ice.jpg';
import saksitImg from '../assets/Boom.jpg';

const teamMembers = [
  {
    name: 'Raffy',
    img: raffyImg,
    github: 'https://github.com/Raffylnwza007',
    instagram: 'https://www.instagram.com/raffynoiz/',
  },
  {
    name: 'Thosaporn',
    img: thosapornImg,
    github: 'https://github.com/oKENDOo',
    instagram: 'https://www.instagram.com/k.e.n_d.o/',
  },
  {
    name: 'Phutthisan',
    img: phutthisanImg,
    github: 'https://github.com/Phutthi-1st',
    instagram: 'https://www.instagram.com/phutthiq_fi/',
  },
  {
    name: 'Pannatat',
    img: pannatatImg,
    github: 'https://github.com/Pannatat-Pip',
    instagram: 'https://www.instagram.com/ming_pntp/',
  },
  {
    name: 'Purinut',
    img: purinutImg,
    github: 'https://github.com/purinut123',
    instagram: 'https://www.instagram.com/puripop_/',
  },
  {
    name: 'Nantanan',
    img: nantananImg,
    github: 'https://github.com/fourthapril',
    instagram: 'https://www.instagram.com/moonly_np/',
  },
  {
    name: 'Saksit',
    img: saksitImg,
    github: 'https://github.com/Saksit-Jittasopee',
    instagram: 'https://www.instagram.com/saksitjittasopee/',
  },
];

export const OurTeam = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faff] pb-20 pt-8 px-2 md:px-6">
      {/* ปรับ max-w ให้กว้างขึ้นเป็น 1600px เพื่อให้บนจอใหญ่รูปขยายได้เต็มที่ */}
      <div className="max-w-[1600px] mx-auto w-full">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-gray-700 hover:text-black mb-8 flex items-center gap-1 transition ml-2"
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#2f65ff] text-center mb-12">
          Our Team
        </h1>

        {/* Team Members - บังคับ 7 คอลัมน์ตลอดเวลา (grid-cols-7) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-3 md:gap-6 w-full">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              /* เปลี่ยนจาก fix ขนาด เป็น w-full เพื่อให้ขยายตาม grid */
              className="flex flex-col items-center w-full"
            >

              {/* Profile Image - ล็อคแค่สัดส่วน 2/3 ส่วนกว้างยาวจะยืดหดตามจอ */}
              <div className="w-full aspect-[2/3] bg-gray-300 mb-2 md:mb-4 overflow-hidden rounded-md shadow-sm">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name - ปรับขนาดฟอนต์ให้เล็กลงเวลากรอบแคบ */}
              <h3 className="font-bold text-gray-900 mb-2 text-[10px] sm:text-xs md:text-base text-center truncate w-full px-1">
                {member.name}
              </h3>

              {/* Social Links */}
              <div className="flex gap-1 md:gap-3">

                {/* Instagram Icon */}
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-5 h-5 md:w-8 md:h-8 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  title={`${member.name}'s Instagram`}
                >
                  <FaInstagram className="w-3 h-3 md:w-4 md:h-4" />
                </a>

                {/* GitHub Icon */}
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-5 h-5 md:w-8 md:h-8 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-800 cursor-pointer hover:bg-gray-50 hover:scale-105 transition-all shadow-sm"
                  title={`${member.name}'s GitHub`}
                >
                  <FaGithub className="w-3 h-3 md:w-4 md:h-4" />
                </a>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};