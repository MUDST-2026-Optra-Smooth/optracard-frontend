import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const canOpenPathForRole = (role: string, path: string) => {
  if (role === 'SUPER_ADMIN') return path.startsWith('/superadmin');
  if (role === 'ADMIN') return path.startsWith('/admin') || path.startsWith('/AD');
  return !path.startsWith('/admin') && !path.startsWith('/AD') && !path.startsWith('/superadmin');
};

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const loginMessage = typeof location.state?.message === 'string' ? location.state.message : null;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json().catch(() => null);
      
      if (response.ok) {
        login(
          { username: data.username, email: formData.email, role: data.role },
          data.token,
        );
        const requestedPath =
          typeof location.state?.from === 'string'
            ? location.state.from
            : location.state?.from?.pathname;
        const roleHome = data.role === 'SUPER_ADMIN'
          ? '/superadmin/overview'
          : data.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/';
        const destination = requestedPath && canOpenPathForRole(data.role, requestedPath)
          ? requestedPath
          : roleHome;
        navigate(destination);
      } else {
        alert(data?.message || 'Login failed');
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
          {loginMessage && (
            <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700" role="status">
              {loginMessage}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
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
