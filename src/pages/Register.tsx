import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error connecting to backend server', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] py-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md relative">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-sm text-gray-600 flex items-center hover:text-black">
          ← Back
        </button>

        <div className="text-center mb-6 mt-4">
          <div className="flex justify-center items-center gap-2 text-xl font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">O</div>
            Optracard
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join the Arena</h2>
          <p className="text-sm text-gray-500">Create your account and start collecting.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
              required 
            />
          </div>
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
          <div className="mb-4">
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
          <div className="mb-8">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#2f65ff] text-white font-medium py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm">
            Create an account
          </button>
        </form>
      </div>
    </div>
  );
};
