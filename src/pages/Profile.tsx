import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import defaultAvatar from '../assets/Generic avatar.png';

export const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only for now — no backend endpoint wired up yet.
    console.log('Profile update submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-sm text-gray-600 flex items-center hover:text-black"
        >
          ← Back
        </button>

        <div className="flex justify-center mt-10 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#ece7fb] flex items-center justify-center">
              <img src={avatarPreview} alt="Profile avatar" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-300 rounded-md flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
              aria-label="Change profile picture"
            >
              <FiEdit2 className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your Username"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your Password"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Your Phone Number"
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 text-xs font-semibold mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your Address"
              rows={3}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2f65ff] text-white font-medium py-2.5 rounded-full hover:bg-blue-700 transition duration-200 text-sm"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
