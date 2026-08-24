export const Footer = () => {
  return (
    <footer className="bg-[#0b0f19] text-white py-12 px-6 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold mb-4">
            <div className="w-8 h-8 bg-transparent border-2 border-white rounded flex items-center justify-center text-sm">O</div>
            <span>Optracard</span>
          </div>
          <p className="text-sm text-gray-200 font-semibold leading-relaxed">
            Empowering Thailand's TCG community <br />
            to push boundaries and reach the next level !
          </p>
        </div>

        <div className="flex gap-4">
          <a href="#" className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center font-bold hover:opacity-80 transition">
            FB
          </a>
          <a href="#" className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold hover:opacity-80 transition">
            IG
          </a>
          <a href="#" className="w-12 h-12 bg-transparent border-2 border-white rounded-full flex items-center justify-center font-bold hover:bg-white hover:text-black transition">
            GH
          </a>
        </div>
      </div>
    </footer>
  );
};
