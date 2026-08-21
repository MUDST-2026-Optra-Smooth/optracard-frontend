
export const Footer = () => {
  return (
    <footer className="bg-[#11111a] text-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center gap-2 text-2xl font-bold mb-4">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center rounded">O</div>
            Optracard
          </div>
          <p className="text-gray-400 text-sm max-w-xs">
            Empowering Thailand's TCG community to push boundaries and reach the next level !
          </p>
        </div>
        
        <div className="flex space-x-4">
          <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:opacity-80">FB</a>
          <a href="#" className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full flex items-center justify-center hover:opacity-80">IG</a>
          <a href="#" className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:bg-gray-800">GH</a>
        </div>
      </div>
    </footer>
  );
};

