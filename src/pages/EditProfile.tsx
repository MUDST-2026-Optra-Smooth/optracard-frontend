import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import defaultAvatar from '../assets/Generic avatar.png';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

interface ProfileData {
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

interface ProfileUpdateResponse {
  profile: ProfileData;
  token: string;
  message?: string;
}

interface ProfileFormData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, login, logout } = useAuth();

  const [avatarPreview, setAvatarPreview] = useState<string>(defaultAvatar);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);

  const redirectToLogin = (message?: string) => {
    logout();
    navigate('/login', {
      replace: true,
      state: {
        from: location,
        message,
      },
    });
  };

  useEffect(() => {
    if (logoutCountdown === null) {
      return;
    }

    if (logoutCountdown === 0) {
      logout();
      navigate('/login', {
        replace: true,
        state: {
          from: '/profile',
          message: 'บันทึกข้อมูลลงฐานข้อมูลแล้ว กรุณาล็อกอินใหม่อีกครั้ง',
        },
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setLogoutCountdown((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [logout, logoutCountdown, navigate]);

  const loadProfile = async (signal?: AbortSignal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin('ยังไม่ได้บันทึกข้อมูล กรุณาล็อกอินใหม่ก่อนแก้ไขโปรไฟล์');
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (response.status === 401 || response.status === 403) {
        redirectToLogin('เซสชันหมดอายุ กรุณาล็อกอินใหม่เพื่อแก้ไขโปรไฟล์');
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to load profile');
      }

      const data = (await response.json()) as ProfileData;
      setFormData({
        username: data.username ?? '',
        email: data.email ?? '',
        password: '',
        phoneNumber: data.phone ?? '',
        address: data.address ?? '',
      });
    } catch (requestError) {
      if ((requestError as Error).name !== 'AbortError') {
        setLoadError('Unable to load your profile. Please try again.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadProfile(controller.signal);

    return () => controller.abort();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({ ...previous, [e.target.name]: e.target.value }));
    setSaveError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logoutCountdown !== null) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);

    if (!formData.username.trim() || !formData.email.trim()) {
      setSaveError('Username and email are required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin('ยังไม่ได้บันทึกข้อมูล กรุณาล็อกอินใหม่ก่อนบันทึก');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          ...(formData.password.trim() ? { password: formData.password } : {}),
        }),
      });

      const data = (await response.json().catch(() => null)) as ProfileUpdateResponse | { message?: string } | null;

      if (response.status === 401 || response.status === 403) {
        redirectToLogin('ยังไม่ได้บันทึกข้อมูล เนื่องจากเซสชันหมดอายุ กรุณาล็อกอินใหม่');
        return;
      }

      if (!response.ok) {
        throw new Error(data && 'message' in data ? data.message || 'Unable to save profile' : 'Unable to save profile');
      }

      if (!data || !('profile' in data) || !data.profile || !data.token) {
        throw new Error('Invalid profile response');
      }

      login(
        {
          username: data.profile.username,
          email: data.profile.email,
          role: user?.role ?? 'USER',
        },
        data.token,
      );
      setSaveSuccess('บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว');
      setLogoutCountdown(5);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'ไม่ทราบสาเหตุ';
      setSaveError(`ยังไม่ได้บันทึกข้อมูลลงฐานข้อมูล: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md relative">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="absolute top-6 left-6 text-sm text-gray-600 flex items-center hover:text-black"
        >
          ← Back
        </button>

        <h2 className="text-center text-base font-bold text-gray-900 pt-1">Edit Profile</h2>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading your profile...</div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mt-8 mb-8">
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

            {saveSuccess && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                <p className="font-semibold">{saveSuccess}</p>
                {logoutCountdown !== null && (
                  <p className="mt-1">
                    กำลังล็อกเอาต์ใน {logoutCountdown} วินาที กรุณาล็อกอินใหม่
                  </p>
                )}
              </div>
            )}

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
                  placeholder="Your Email"
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-xs font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
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

              <div className="mb-4">
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

              {saveError && <p className="mb-4 text-xs text-red-600">{saveError}</p>}

              <button
                type="submit"
                disabled={isSaving || logoutCountdown !== null}
                className="w-full bg-[#2f65ff] text-white font-medium py-2.5 rounded-full hover:bg-blue-700 transition duration-200 text-sm mb-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-red-500 text-white font-medium py-2.5 rounded-full hover:bg-red-600 transition duration-200 text-sm"
              >
                Logout
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
