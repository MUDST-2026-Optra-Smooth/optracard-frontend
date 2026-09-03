import { Routes, Route, useLocation } from 'react-router-dom';
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
import { OrdersManagement } from './pages/OrdersManagement';
import { Seller } from './pages/seller';
import { Dashboard } from './pages/Dashboard';
import { OrderHistory } from './pages/OrderHistory';
import ProductDetail from './pages/PDdetail';
import EditProduct from './pages/EditProduct';
import AddProduct from './pages/AddProduct';

export function App() {
  const location = useLocation();

  // เพิ่ม '/add-product' เข้าไปในรายการที่ต้องซ่อน Navbar และ Footer
  const hideNavAndFooterPaths = ['/dashboard', '/orders-management', '/seller', '/add-product'];
  
  const shouldHideNavAndFooter = 
    hideNavAndFooterPaths.includes(location.pathname) || 
    location.pathname.startsWith('/edit-product');

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNavAndFooter && <Navbar />}
      
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
          <Route path="/orders-management" element={<OrdersManagement />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<div className="p-10 text-center text-2xl font-bold">Cart Page (Coming Soon)</div>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/add-product" element={<AddProduct />} />
        </Routes>
      </main>
      
      {!shouldHideNavAndFooter && <Footer />}
    </div>
  );
}