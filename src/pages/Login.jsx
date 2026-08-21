import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // TODO: Connect to Spring Boot API
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md relative">
        
        {/* Back Button */}
        <Link to="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>

        {/* Logo Section */}
        <div className="flex justify-center items-center gap-2 mb-6 mt-4">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            {/* Placeholder for your actual SVG logo */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.092 2.019-.273 3.003m5.637 5.232c-1.127 1.2-2.5 2.148-4.041 2.76A13.921 13.921 0 0112 21c-3.13 0-5.992-1.11-8.21-2.96" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Optracard</h1>
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome To Optracard !</h2>
          <p className="text-sm text-gray-500">Sign in to hunt your rare cards.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="identifier">
              Username or Email
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            Login
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-6 text-center text-sm text-gray-600">
          New to Optracard?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Create an account
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Login;