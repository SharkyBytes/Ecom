import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useFlashSale } from '../hooks/useFlashSale';
import { MOCK_USERS } from '../services/mockData';
import { APP_CONFIG } from '../utils/constants';

// Meesho Landing Page Components
const logoUrl = "https://www.meesho.com/assets/svgicons/meeshoLogo.svg";

const sampleCarousel = [
  { id: 1, title: "Mega Blockbuster Sale", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop", href: "#sale" },
  { id: 2, title: "Up to 80% off", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop", href: "#offers" },
  { id: 3, title: "Shop Now", image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&h=400&fit=crop", href: "#shop" },
];

const sampleProducts = [
  {
    id: 1,
    title: "Kurtis & Suits",
    price: "₹499",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Men Fashion",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Footwear",
    price: "₹299",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Home & Kitchen",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Beauty & Care",
    price: "₹149",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop",
  },
];

function TopBar({ hasActiveFlashSales, onViewFlashSale }) {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img
              src={logoUrl}
              alt="Meesho"
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="text-2xl font-extrabold text-fuchsia-800" style={{ display: 'none' }}>
              Meesho
            </div>

          </div>
          <div className="flex-1 px-4">
            <div className="relative max-w-2xl mx-auto">
              <input
                aria-label="Search"
                className="w-full border rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Try Saree, Kurti or Search by Product Code"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {hasActiveFlashSales && (
              <button
                onClick={onViewFlashSale}
                className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse"
              >
                ⚡ Flash Sale!
              </button>
            )}

            <button className="hidden md:block px-4 py-2 rounded-md border text-sm">Become a Supplier</button>
            <div className="text-sm text-gray-600">Profile</div>
            <div className="text-sm text-gray-600">Cart</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Carousel({ items = [] }) {
  const [index, setIndex] = useState(0);
  const max = items.length;
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % max);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [max]);

  return (
    <div className="relative bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-lg overflow-hidden h-56 md:h-80 bg-white shadow">
          {items.map((it, i) => (
            <a
              key={it.id}
              href={it.href}
              className={`absolute inset-0 transform transition-transform duration-700 ${i === index ? "translate-x-0 opacity-100 z-10" :
                i < index ? "-translate-x-full opacity-0 z-0" : "translate-x-full opacity-0 z-0"
                }`}
            >
              <img
                src={it.image}
                alt={it.title}
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.05) brightness(0.95)" }}
              />
              <div className="absolute right-8 top-1/4 bg-white/90 rounded-md px-6 py-4 shadow-lg">
                <h3 className="text-2xl font-bold text-fuchsia-800">{it.title}</h3>
                <p className="mt-2 text-sm text-gray-600">Smart shopping trusted by millions</p>
                <div className="mt-4">
                  <button className="px-4 py-2 rounded-full bg-fuchsia-800 text-white text-sm">Shop Now</button>
                </div>
              </div>
            </a>
          ))}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setIndex((idx) => (idx - 1 + max) % max)}
              className="bg-white p-2 rounded-full shadow"
              aria-label="Prev"
            >
              ◀
            </button>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={() => setIndex((idx) => (idx + 1) % max)}
              className="bg-white p-2 rounded-full shadow"
              aria-label="Next"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <a href="#" className="block p-4">
        <div className="h-40 md:h-48 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
          <img src={product.image} alt={product.title} className="object-contain h-full" />
        </div>
        <h4 className="mt-3 text-sm font-medium text-gray-800">{product.title}</h4>
        <div className="mt-1 text-sm text-fuchsia-800 font-semibold">{product.price}</div>
      </a>
      <div className="p-3 border-t text-center">
        <button className="px-3 py-1 rounded-full border text-sm">Add to cart</button>
      </div>
    </div>
  );
}

function FlashSaleBanner({ flashSales, onViewFlashSale }) {
  if (!flashSales || flashSales.length === 0) return null;

  const flashSale = flashSales[0];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    const discount = ((flashSale.originalPrice - flashSale.discountedPrice) / flashSale.originalPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="relative bg-gradient-to-r from-red-500 via-fuchsia-800 to-red-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-bounce"></div>
          <div className="absolute top-8 right-8 w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-1/4 w-5 h-5 bg-yellow-300 rounded-full animate-bounce delay-300"></div>
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <span className="text-3xl mr-2 animate-pulse">⚡</span>
                <h2 className="text-2xl md:text-3xl font-bold">FLASH SALE LIVE!</h2>
                <span className="text-3xl ml-2 animate-pulse">⚡</span>
              </div>

              <p className="text-lg mb-2 opacity-90">
                🎯 <strong>{flashSale.productName}</strong>
              </p>

              <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                <span className="text-2xl font-bold text-yellow-300">
                  {formatPrice(flashSale.discountedPrice)}
                </span>
                <span className="text-lg line-through opacity-75">
                  {formatPrice(flashSale.originalPrice)}
                </span>
                <span className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                  {calculateDiscount()}% OFF
                </span>
              </div>

              <p className="text-sm opacity-90 mb-4">
                🔥 Limited time offer - Only 1 piece available!
              </p>

              <button
                onClick={() => {
                  console.log('GRAB NOW clicked!');
                  if (onViewFlashSale) {
                    onViewFlashSale();
                  } else {
                    console.error('onViewFlashSale function not available');
                  }
                }}
                className="bg-white text-red-600 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-100 active:bg-yellow-200 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg cursor-pointer relative z-10 border-2 border-white hover:border-yellow-300"
                type="button"
                style={{ pointerEvents: 'auto' }}
              >
                🛒 GRAB NOW!
              </button>
            </div>

            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-4 shadow-xl">
                <img
                  src={flashSale.image}
                  alt={flashSale.productName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');

                    ctx.fillStyle = '#f87171';
                    ctx.fillRect(0, 0, 128, 128);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('⚡', 64, 64);

                    e.target.src = canvas.toDataURL();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}

const User2Page = () => {
  const [user] = useState(MOCK_USERS.user2);
  const navigate = useNavigate();

  const {
    flashSales,
    loading,
    error,
    hasActiveFlashSales
  } = useFlashSale('user2');

  const handleViewFlashSale = () => {
    navigate(APP_CONFIG.ROUTES.FLASH_SALE);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        hasActiveFlashSales={hasActiveFlashSales}
        onViewFlashSale={handleViewFlashSale}
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        </div>
      )}

      <main className="mt-6">
        <Carousel items={sampleCarousel} />

        <FlashSaleBanner
          flashSales={flashSales}
          onViewFlashSale={handleViewFlashSale}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-fuchsia-800">Personalized Recommedations</h2>
            <a href="#" className="text-sm text-fuchsia-800">View all</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sampleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>


      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-sm text-gray-600">
          © {new Date().getFullYear()} Meesho — Welcome, {user.name}!
        </div>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-fuchsia-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default User2Page;