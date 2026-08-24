import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div>
      <section className="w-full h-64 bg-gray-200 flex items-center justify-center">
        <h2>[Hero Banner Placeholder]</h2>
      </section>

      <section className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600">Marketplace & Trading</h2>
          <Link to="/marketplace" className="text-blue-500 hover:text-blue-700 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <ProductCard title="Placeholder 1" price={298} />
          <ProductCard title="Placeholder 2" price={298} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-8 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>
        
        <div className="text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Single</h3>
            <Link to="/single" className="text-blue-500 hover:text-blue-700 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <ProductCard title="พี่หน่วง พิธีกรผมสวย" price={3000} />
            <ProductCard title="Raichu & Alolan Raichu GX" price={9600} />
          </div>
        </div>

      </section>
    </div>
  );
};
