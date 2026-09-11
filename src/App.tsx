import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
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
import { Cart } from './pages/Cart';
import { EditProfile } from './pages/EditProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ADaddProduct } from './pages/AD_addProduct';
import { ADdashboard } from './pages/AD_dashboard';
import { ADeditProduct } from './pages/AD_editProduct';
import { AD_MarketplaceRequestsList } from './pages/AD_MarketplacelistRequests';
import { AD_MarketplaceProducts } from './pages/AD_MarketplaceProducts';
import { AD_MarketplaceProductDetail } from './pages/AD_MarketplaceProductsdetail';
import { AD_MarketplaceRequestDetail } from './pages/AD_MarketplaceRequests';
import { AD_MarketplaceStorelist } from './pages/AD_MarketplaceStorelist';
import { ADorderDetail } from './pages/AD_orderDetail';
import { ADordersManagement } from './pages/AD_ordersManagement';
import { ADpddetail } from './pages/AD_pddetail';
import { ADseller } from './pages/AD_seller';
import { ADstoreRequest } from './pages/AD_storeRequest';
import { ADstoreRequestdetail } from './pages/AD_storeRequestdetail';
import { SPAD_AddAdmin } from './pages/SPAD_AddAdmin';
import { SPAD_Catalog } from './pages/SPAD_Catalog';
import { SPAD_Overview } from './pages/SPAD_Overview';
import { SPAD_Staff } from './pages/SPAD_Staff';
import { SPAD_StoreDetail } from './pages/SPAD_StoreDetail';
import { SPAD_Stores } from './pages/SPAD_Stores';
import { SPAD_Transactions } from './pages/SPAD_Transactions';
import { SPAD_Users } from './pages/SPAD_Users';

const LegacyAdminRedirect = ({ to }: { to: string }) => {
  const location = useLocation();
  const params = useParams();
  const target = Object.entries(params).reduce(
    (path, [name, value]) => path.replace(`:${name}`, encodeURIComponent(value ?? '')),
    to,
  );

  return <Navigate to={`${target}${location.search}`} replace />;
};

export function App() {
  const location = useLocation();

  // เพิ่ม '/add-product' เข้าไปในรายการที่ต้องซ่อน Navbar และ Footer
  const hideNavAndFooterPaths = ['/dashboard', '/orders-management', '/seller', '/add-product'];
  
  const shouldHideNavAndFooter = 
    hideNavAndFooterPaths.includes(location.pathname) || 
    location.pathname.startsWith('/edit-product') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/AD') ||
    location.pathname.startsWith('/superadmin');

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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/start-selling" element={<ProtectedRoute><StartSelling /></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/stocks" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADseller /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADdashboard /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADaddProduct /></ProtectedRoute>} />
          <Route path="/admin/products/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADeditProduct /></ProtectedRoute>} />
          <Route path="/admin/products/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADpddetail /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADordersManagement /></ProtectedRoute>} />
          <Route path="/admin/orders/:orderId" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADorderDetail /></ProtectedRoute>} />
          <Route path="/admin/store-requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADstoreRequest /></ProtectedRoute>} />
          <Route path="/admin/store-requests/:id?" element={<ProtectedRoute allowedRoles={['ADMIN']}><ADstoreRequestdetail /></ProtectedRoute>} />
          <Route path="/admin/marketplace/products" element={<ProtectedRoute allowedRoles={['ADMIN']}><AD_MarketplaceProducts /></ProtectedRoute>} />
          <Route path="/admin/marketplace/stores/:storeId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AD_MarketplaceStorelist /></ProtectedRoute>} />
          <Route path="/admin/marketplace/products/:productId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AD_MarketplaceProductDetail /></ProtectedRoute>} />
          <Route path="/admin/marketplace/requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><AD_MarketplaceRequestsList /></ProtectedRoute>} />
          <Route path="/admin/marketplace/requests/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AD_MarketplaceRequestDetail /></ProtectedRoute>} />
          <Route path="/ADseller" element={<LegacyAdminRedirect to="/admin/stocks" />} />
          <Route path="/ADaddProduct" element={<LegacyAdminRedirect to="/admin/products/new" />} />
          <Route path="/ADeditProduct/:id" element={<LegacyAdminRedirect to="/admin/products/:id/edit" />} />
          <Route path="/ADdashboard" element={<LegacyAdminRedirect to="/admin/dashboard" />} />
          <Route path="/ADordersManagement" element={<LegacyAdminRedirect to="/admin/orders" />} />
          <Route path="/ADorderDetail/:orderId" element={<LegacyAdminRedirect to="/admin/orders/:orderId" />} />
          <Route path="/ADpddetail/:id" element={<LegacyAdminRedirect to="/admin/products/:id" />} />
          <Route path="/ADstoreRequest" element={<LegacyAdminRedirect to="/admin/store-requests" />} />
          <Route path="/ADstoreRequestdetail/:id?" element={<LegacyAdminRedirect to="/admin/store-requests/:id" />} />
          <Route path="/AD_MarketplaceProducts" element={<LegacyAdminRedirect to="/admin/marketplace/products" />} />
          <Route path="/AD_MarketplaceStorelist/:storeId" element={<LegacyAdminRedirect to="/admin/marketplace/stores/:storeId" />} />
          <Route path="/AD_MarketplaceProductsdetail/:productId" element={<LegacyAdminRedirect to="/admin/marketplace/products/:productId" />} />
          <Route path="/AD_MarketplacelistRequests" element={<LegacyAdminRedirect to="/admin/marketplace/requests" />} />
          <Route path="/AD_MarketplaceRequestDetail/:id" element={<LegacyAdminRedirect to="/admin/marketplace/requests/:id" />} />
          <Route path="/AD_MarketplaceRequests/:id" element={<LegacyAdminRedirect to="/admin/marketplace/requests/:id" />} />
          <Route path="/superadmin" element={<Navigate to="/superadmin/overview" replace />} />
          <Route path="/superadmin/overview" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Overview /></ProtectedRoute>} />
          <Route path="/superadmin/stores" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Stores /></ProtectedRoute>} />
          <Route path="/superadmin/stores/:storeId" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_StoreDetail /></ProtectedRoute>} />
          <Route path="/superadmin/catalog" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Catalog /></ProtectedRoute>} />
          <Route path="/superadmin/transactions" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Transactions /></ProtectedRoute>} />
          <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Users /></ProtectedRoute>} />
          <Route path="/superadmin/staff" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_Staff /></ProtectedRoute>} />
          <Route path="/superadmin/staff/add" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SPAD_AddAdmin /></ProtectedRoute>} />
          <Route path="/orders-management" element={<OrdersManagement />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
      
      {!shouldHideNavAndFooter && <Footer />}
    </div>
  );
}
