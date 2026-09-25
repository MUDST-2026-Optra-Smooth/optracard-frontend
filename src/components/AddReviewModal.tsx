import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

export const AddReviewModal = ({ isOpen, onClose, sellerName, onSubmit }: AddReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, comment: comment.trim() });
    setRating(0);
    setHoverRating(0);
    setComment('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Add a Review</h3>
            <p className="text-xs text-gray-400 mt-0.5">Share your experience with {sellerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star`}
                className="cursor-pointer transition"
              >
                <Star
                  size={30}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think? (optional)"
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3 rounded-full text-sm transition cursor-pointer"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReviewModal;
