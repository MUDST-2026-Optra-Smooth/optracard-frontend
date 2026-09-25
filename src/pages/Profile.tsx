import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import defaultAvatar from '../assets/Generic avatar.png';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

interface CollectionItemResponse {
  id: number;
  name: string;
  game: string;
  imageUrl?: string | null;
  quantity: number;
}

interface ProfileResponse {
  userId: number;
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  collection: CollectionItemResponse[];
}

interface CollectionCard {
  id: string;
  name: string;
  game: string;
  imageUrl?: string | null;
  quantity: number;
  hidden: boolean;
}

const CARD_GRADIENTS = ['from-indigo-500 to-blue-600'];

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
  </div>
);

const toCollectionCard = (item: CollectionItemResponse): CollectionCard => ({
  id: String(item.id),
  name: item.name,
  game: item.game || 'Unknown',
  imageUrl: item.imageUrl,
  quantity: Number(item.quantity) || 1,
  hidden: false,
});

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (signal?: AbortSignal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { from: location } });
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to load profile');
      }

      const data = (await response.json()) as ProfileResponse;
      setProfile(data);
      setCollection((data.collection ?? []).map(toCollectionCard));
    } catch (requestError) {
      if ((requestError as Error).name !== 'AbortError') {
        setError('Unable to load your profile. Please try again.');
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

  const allHidden = collection.length > 0 && collection.every((card) => card.hidden);

  const toggleCard = (id: string) => {
    setCollection((prev) => prev.map((card) => (card.id === id ? { ...card, hidden: !card.hidden } : card)));
  };

  const toggleAll = () => {
    setCollection((prev) => prev.map((card) => ({ ...card, hidden: !allHidden })));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-sm text-gray-500">
            Loading your profile...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Try again
            </button>
          </div>
        ) : profile ? (
          <>
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col sm:flex-row gap-12 items-center sm:items-start">
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                  <img src={defaultAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                className="absolute top-6 right-6 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md flex items-center justify-center transition cursor-pointer"
                aria-label="Edit profile"
              >
                <Pencil size={16} />
              </button>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <InfoRow label="Username" value={profile.username || '—'} />
                <InfoRow label="Email" value={profile.email || '—'} />
                <InfoRow label="Password" value="••••••••" />
                <InfoRow label="Phone Number" value={profile.phone?.trim() || 'Not provided'} />
                <div className="sm:col-span-2">
                  <InfoRow label="Address" value={profile.address?.trim() || 'Not provided'} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Card Collection</h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Cards in this collection are based on your purchase history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  disabled={collection.length === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-full transition cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {allHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                  {allHidden ? 'Unhide All' : 'Hide All'}
                </button>
              </div>

              {collection.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-gray-600">No purchased cards yet.</p>
                  <p className="mt-1 text-xs text-gray-400">Cards from your orders will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  {collection.map((card, idx) => {
                    const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
                    return (
                      <button
                        type="button"
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        className="group text-left cursor-pointer transition duration-200 hover:-translate-y-1 hover:scale-[1.03]"
                        aria-label={card.hidden ? `Unhide ${card.name}` : `Hide ${card.name}`}
                      >
                        <div
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 ${
                            card.hidden ? 'grayscale' : ''
                          }`}
                        >
                          {card.imageUrl ? (
                            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-center px-2 bg-gradient-to-br ${gradient} text-white text-xs font-bold leading-snug`}
                            >
                              {card.name}
                            </div>
                          )}
                          {card.hidden && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <EyeOff size={20} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-2 truncate">{card.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {card.game}{card.quantity > 1 ? ` · Qty ${card.quantity}` : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
