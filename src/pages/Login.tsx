import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  //const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        //login(data.user, data.token);
        
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error connecting to backend server', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 text-xl font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">O</div>
            Optracard
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome To Optracard !</h2>
          <p className="text-sm text-gray-500">Sign in to hunt your rare cards.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Username or Email</label>
            <input 
              type="text" 
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#2f65ff] text-white font-medium py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm">
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-gray-500">
          New to Optracard? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
