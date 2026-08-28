import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OurTeam } from './pages/OurTeam';
import { AboutUs } from './pages/Aboutus';
import { ViewAllOOS } from './pages/ViewAllOOS';
import { ViewAllTrading } from './pages/ViewAllTrading'; 
import { SearchResult } from './pages/SearchResult'; 
import { Profile } from './pages/Profile';
import { StartSelling } from './pages/StartSelling';
import { OrderHistory } from './pages/OrderHistory';

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
          <Route path="/ViewAllOOS" element={<ViewAllOOS />} />
          <Route path="/ViewAllTrading" element={<ViewAllTrading />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/start-selling" element={<StartSelling />} />
          <Route path="/order-history" element={<OrderHistory />} />
          
          <Route path="/cart" element={<div className="p-10 text-center text-2xl font-bold">Cart Page (Coming Soon)</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}