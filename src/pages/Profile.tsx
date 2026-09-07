import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import defaultAvatar from '../assets/Generic avatar.png';

interface CollectionCard {
  id: string;
  name: string;
  game: string;
  imageUrl?: string;
  hidden: boolean;
}

// TODO: replace with the logged-in user's real profile data once the backend exists
const USER = {
  username: 'John_Doe',
  email: 'john@example.com',
  phoneNumber: '089-123-4567',
  address: '88/12 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
};

// TODO: replace with the user's real purchased cards once orders/inventory are wired up
const INITIAL_COLLECTION: CollectionCard[] = [
  { id: '1', name: 'Charizard ex (006/165)', game: 'Pokemon', imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png', hidden: false },
  { id: '2', name: 'Blue-Eyes White Dragon', game: 'Yu-Gi-Oh', imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', hidden: false },
  { id: '3', name: 'พี่หน่วง พิธีกรผมสวย', game: 'Battle of Talingchan', hidden: true },
  { id: '4', name: 'Gangplank, Naval', game: 'Riftbound', hidden: false },
  { id: '5', name: 'Dark Magician', game: 'Yu-Gi-Oh', hidden: false },
  { id: '6', name: 'Pikachu', game: 'Pokemon', hidden: false },
  { id: '7', name: 'Exodia the Forbidden One', game: 'Yu-Gi-Oh', hidden: true },
];

const CARD_GRADIENTS = [
  'from-indigo-500 to-blue-600',
];

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

export const Profile = () => {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionCard[]>(INITIAL_COLLECTION);

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
        {/* Profile Info */}
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
            <InfoRow label="Username" value={USER.username} />
            <InfoRow label="Email" value={USER.email} />
            <InfoRow label="Password" value="••••••••" />
            <InfoRow label="Phone Number" value={USER.phoneNumber} />
            <div className="sm:col-span-2">
              <InfoRow label="Address" value={USER.address} />
            </div>
          </div>
        </div>

        {/* Card Collection */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Card Collection</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Cards you hide won't be shown to other users browsing your collection.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-full transition cursor-pointer shrink-0"
            >
              {allHidden ? <Eye size={14} /> : <EyeOff size={14} />}
              {allHidden ? 'Unhide All' : 'Hide All'}
            </button>
          </div>

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
                  <p className="text-[11px] text-gray-400">{card.game}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
