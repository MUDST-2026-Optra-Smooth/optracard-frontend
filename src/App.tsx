import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OurTeam } from './pages/OurTeam';
import { AboutUs } from './pages/Aboutus';
import { Single } from './pages/Single';
import { Marketplace } from './pages/Marketplace'; 

export function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/team" element={<OurTeam />} />
          <Route path="/single" element={<Single />} />
          <Route path="/marketplace" element={<Marketplace />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}
