interface ProductCardProps {
  title: string;
  price: number;
  imageUrl?: string;
}

export const ProductCard = ({ title, price, imageUrl }: ProductCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col justify-between">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4">
        {imageUrl ? <img src={imageUrl} alt={title} className="max-h-full" /> : <span>[Image]</span>}
      </div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-lg font-bold text-gray-800 mt-2">฿{price.toLocaleString()}</p>
      </div>
      <button className="mt-4 w-full bg-blue-100 text-blue-600 py-2 rounded-md hover:bg-blue-200 transition">
        🛒 Add to Cart
      </button>
    </div>
  );
};

