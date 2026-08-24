import logoIcon from '../assets/logo-icon.png'; // สมมติว่าไฟล์ Footer.tsx อยู่ในโฟลเดอร์ components

export const Footer = () => {
  return (
    <footer className="bg-[#0b0f19] text-white py-12 px-6 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div>
          {/* อัปเดตส่วน Logo ตรงนี้ */}
          <div className="flex items-center gap-2 text-2xl font-bold mb-4">
            <img src={logoIcon} alt="Optracard Logo" className="w-8 h-8 object-contain" />
            <span>Optracard</span>
          </div>
          <p className="text-sm text-gray-200 font-semibold leading-relaxed">
            Empowering Thailand's TCG community <br />
            to push boundaries and reach the next level !
          </p>
        </div>

        {/* Social Icons Section */}
        <div className="flex gap-4">
          
          {/* Facebook - Official Blue */}
          <a 
            href="#" 
            aria-label="Facebook"
            className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(24,119,242,0.5)]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Instagram - Official Gradient */}
          <a 
            href="#" 
            aria-label="Instagram"
            className="w-12 h-12 bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] rounded-full flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(193,53,132,0.5)]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* GitHub - Official Dark Gray (with border to stand out from dark background) */}
          <a 
            href="#" 
            aria-label="GitHub"
            className="w-12 h-12 bg-[#24292e] border border-gray-700 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          
        </div>
      </div>
    </footer>
  );
};