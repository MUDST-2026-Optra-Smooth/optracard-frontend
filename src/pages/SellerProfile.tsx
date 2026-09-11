import { useState } from 'react';
import { Share2, Star, Mail, Phone, MapPin, Filter, Package } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { AddReviewModal } from '../components/AddReviewModal';
import { formatDate } from '../context/formatters';
import defaultAvatar from '../assets/Generic avatar.png';

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  game: string;
  imageUrl?: string;
  highlighted: boolean;
  postedDate: string;
}

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

// TODO: replace with the real seller's data once shop pages are backed by an API
const SELLER = {
  name: 'Growing',
  lastActive: 'Active 3 minutes ago',
  soldCount: 128,
  email: 'growing.shop@example.com',
  phone: '089-123-4567',
  address: '88/12 Sukhumvit Road, Khlong Toei, Bangkok 10110',
};

const INITIAL_PRODUCTS: SellerProduct[] = [
  { id: '1', title: 'Charizard ex (006/165)', price: 280, game: 'Pokemon', imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png', highlighted: true, postedDate: '2026-08-27' },
  { id: '2', title: 'Blue-Eyes White Dragon', price: 450, game: 'Yu-Gi-Oh', imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', highlighted: true, postedDate: '2026-08-21' },
  { id: '3', title: 'พี่หน่วง พิธีกรผมสวย', price: 3000, game: 'Battle of Talingchan', highlighted: false, postedDate: '2026-08-18' },
  { id: '4', title: 'Mewtwo', price: 180, game: 'Pokemon', highlighted: false, postedDate: '2026-08-12' },
  { id: '5', title: 'Dark Magician', price: 220, game: 'Yu-Gi-Oh', highlighted: false, postedDate: '2026-08-05' },
  { id: '6', title: 'Pikachu', price: 150, game: 'Pokemon', highlighted: true, postedDate: '2026-07-30' },
  { id: '7', title: 'Exodia the Forbidden One', price: 900, game: 'Yu-Gi-Oh', highlighted: false, postedDate: '2026-07-22' },
  { id: '8', title: 'Avatar Card BT07-015', price: 99, game: 'Battle of Talingchan', highlighted: false, postedDate: '2026-07-15' },
];

const INITIAL_REVIEWS: Review[] = [
  { id: '1', reviewer: 'Kittipong W.', rating: 5, comment: 'Fast shipping, card was in great condition!', date: '2026-08-20' },
  { id: '2', reviewer: 'Nattapong S.', rating: 4, comment: 'Good seller, packaging could be better.', date: '2026-08-15' },
  { id: '3', reviewer: 'Ploy R.', rating: 5, comment: 'Exactly as described. Would buy again.', date: '2026-08-10' },
];

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'highlighted', label: 'Highlighted Products' },
  { id: 'sets', label: 'Product Sets' },
  { id: 'products', label: 'All Products' },
  { id: 'reviews', label: 'Reviews' },
] as const;

type TabId = (typeof TABS)[number]['id'];
type SortId = 'newest' | 'price-low' | 'price-high';

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
);

const ProductGrid = ({ products }: { products: SellerProduct[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
    {products.map((p) => (
      <ProductCard key={p.id} title={p.title} price={p.price} game={p.game} imageUrl={p.imageUrl} />
    ))}
  </div>
);

export const SellerProfile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [sortBy, setSortBy] = useState<SortId>('newest');
  const [products] = useState<SellerProduct[]>(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
  });

  const handleAddReview = ({ rating, comment }: { rating: number; comment: string }) => {
    setReviews((prev) => [
      {
        id: String(Date.now()),
        reviewer: 'You',
        rating,
        comment: comment || 'No comment provided.',
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setIsReviewModalOpen(false);
    setActiveTab('reviews');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Seller header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
                <img src={defaultAvatar} alt={SELLER.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-900">{SELLER.name}</h1>
                <p className="text-xs text-gray-400 mt-0.5">{SELLER.lastActive}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarRating rating={avgRating} />
                  <span className="text-xs font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">Sold: {SELLER.soldCount}</span>
                </div>

                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={13} /> {SELLER.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={13} /> {SELLER.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={13} /> {SELLER.address}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Share shop"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition cursor-pointer"
              >
                <Star size={15} /> Add Review
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-7 border-t border-gray-100 pt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-semibold whitespace-nowrap pb-1 border-b-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {activeTab === 'home' && (
            <>
              <ProductGrid products={sortedProducts.slice(0, 4)} />
            </>
          )}

          {activeTab === 'highlighted' && <ProductGrid products={sortedProducts.filter((p) => p.highlighted)} />}

          {activeTab === 'sets' && (
            <div className="flex flex-col items-center text-center py-16">
              <Package size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No product sets yet</p>
              <p className="text-xs text-gray-400 mt-1">This seller hasn't created any bundles.</p>
            </div>
          )}

          {activeTab === 'products' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition cursor-pointer"
                >
                  <Filter size={14} /> All Filters
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortId)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              <ProductGrid products={sortedProducts} />
            </>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <div>
                  <StarRating rating={avgRating} />
                  <p className="text-xs text-gray-400 mt-0.5">{reviews.length} reviews</p>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">{r.reviewer}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(r.date)}</p>
                    </div>
                    <StarRating rating={r.rating} size={12} />
                    <p className="text-sm text-gray-600 mt-1.5">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        sellerName={SELLER.name}
        onSubmit={handleAddReview}
      />
    </div>
  );
};

export default SellerProfile;
