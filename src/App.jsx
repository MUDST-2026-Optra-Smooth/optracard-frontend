import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import หน้าเว็บทั้งหมด
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ให้หน้า / (หน้าแรกสุด) แสดงผลเป็นหน้า Home */}
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="*" 
          element={
            <div className="flex h-screen items-center justify-center bg-slate-100 text-2xl font-bold text-gray-400">
              404 - Page Not Found
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;