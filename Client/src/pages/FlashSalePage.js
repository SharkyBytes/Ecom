import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { APP_CONFIG } from '../utils/constants';

const FlashSalePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [flashDeal, setFlashDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Get the flash deal ID from the URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const flashDealId = searchParams.get('id');
  
  // Mock flash deal data
  useEffect(() => {
    if (flashDealId) {
      // In a real app, we would fetch this from the API
      setFlashDeal({
        id: flashDealId,
        productName: 'Cotton Kurti Blue',
        originalPrice: 899.99,
        discountedPrice: 674.99,
        discountPercent: 25,
        image: 'https://images.meesho.com/images/products/42944024/jvgnb_512.jpg',
        description: 'Elegant blue cotton kurti with traditional design. Perfect for casual wear and special occasions.',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 4.2,
        reviews: 128,
        seller: 'Fashion Hub',
        deliveryTime: '3-4 days',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Red', 'Green']
      });
    }
  }, [flashDealId]);
  
  // Countdown timer
  useEffect(() => {
    if (!flashDeal) return;
    
    const expiresAt = new Date(flashDeal.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiresAt - now;
      
      if (distance < 0) {
        // Deal expired
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timer);
  }, [flashDeal]);
  
  if (!flashDeal) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header title="Flash Sale" showBackButton={true} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading flash deal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <Header title="Flash Sale" showBackButton={true} />
      
      {/* Flash Deal Banner */}
      <div className="bg-gradient-to-r from-meesho-primary to-meesho-secondary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold mb-2">Flash Deal</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Limited time offer</p>
              <p className="text-sm font-bold mt-1">Ends in:</p>
            </div>
            <div className="flex space-x-2">
              <div className="bg-white bg-opacity-20 rounded-md px-2 py-1">
                <span className="text-lg font-bold">{timeLeft.days}</span>
                <span className="text-xs block">days</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-2 py-1">
                <span className="text-lg font-bold">{timeLeft.hours}</span>
                <span className="text-xs block">hrs</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-2 py-1">
                <span className="text-lg font-bold">{timeLeft.minutes}</span>
                <span className="text-xs block">mins</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-2 py-1">
                <span className="text-lg font-bold">{timeLeft.seconds}</span>
                <span className="text-xs block">secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Image */}
      <div className="bg-white">
        <div className="relative">
          <img 
            src={flashDeal.image} 
            alt={flashDeal.productName}
            className="w-full h-auto"
          />
          <div className="absolute top-4 right-4 bg-meesho-secondary text-white text-sm font-bold px-2 py-1 rounded-md">
            {flashDeal.discountPercent}% OFF
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="bg-white p-4 mt-2">
        <h2 className="text-lg font-bold text-gray-800">{flashDeal.productName}</h2>
        <div className="flex items-center mt-1">
          <div className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
            {flashDeal.rating}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 ml-2">{flashDeal.reviews} Reviews</span>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center">
            <span className="text-2xl font-bold">₹{flashDeal.discountedPrice.toFixed(2)}</span>
            <span className="ml-2 text-gray-500 line-through">₹{flashDeal.originalPrice.toFixed(2)}</span>
            <span className="ml-2 text-meesho-secondary font-medium">{flashDeal.discountPercent}% off</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Free Delivery</p>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="bg-white p-4 mt-2">
        <h3 className="font-bold text-gray-800">Product Details</h3>
        <p className="text-sm text-gray-600 mt-2">{flashDeal.description}</p>
        
        <div className="mt-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Seller</span>
            <span className="text-sm font-medium">{flashDeal.seller}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Delivery</span>
            <span className="text-sm font-medium">{flashDeal.deliveryTime}</span>
          </div>
        </div>
      </div>
      
      {/* Size Selection */}
      <div className="bg-white p-4 mt-2">
        <h3 className="font-bold text-gray-800">Select Size</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {flashDeal.sizes.map((size) => (
            <div key={size} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
              {size}
            </div>
          ))}
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="bg-white p-4 mt-2">
        <h3 className="font-bold text-gray-800">Select Color</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {flashDeal.colors.map((color) => (
            <div key={color} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
              {color}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-between">
        <button className="w-1/2 border border-meesho-secondary text-meesho-secondary font-medium py-2 rounded-md mr-2">
          Add to Cart
        </button>
        <button className="w-1/2 bg-meesho-secondary text-white font-medium py-2 rounded-md">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default FlashSalePage;