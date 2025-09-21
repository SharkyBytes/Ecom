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
        image: '/assets/images/blue_kurti.png',
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
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl font-bold">Flash Deal</h1>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Limited time offer</p>
              <p className="text-sm font-bold mt-1">Ends in:</p>
            </div>
            <div className="flex space-x-2">
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="text-lg font-bold">{timeLeft.days}</span>
                <span className="text-xs block">days</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="text-lg font-bold">{timeLeft.hours}</span>
                <span className="text-xs block">hrs</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
                <span className="text-lg font-bold">{timeLeft.minutes}</span>
                <span className="text-xs block">mins</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5">
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
            className="w-full h-auto max-h-[400px] object-contain mx-auto"
          />
          <div className="absolute top-4 right-4 bg-pink-600 text-white text-sm font-bold px-3 py-1 rounded-sm">
            {flashDeal.discountPercent}% OFF
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-60 h-16"></div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="bg-white p-4 mt-2">
        <h2 className="text-lg font-bold text-gray-800">{flashDeal.productName}</h2>
        <div className="flex items-center mt-1">
          <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
            <span>{flashDeal.rating}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 ml-2">{flashDeal.reviews} Reviews</span>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-pink-600">₹{flashDeal.discountedPrice.toFixed(2)}</span>
            <span className="ml-2 text-gray-500 line-through">₹{flashDeal.originalPrice.toFixed(2)}</span>
            <span className="ml-2 bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-medium">{flashDeal.discountPercent}% off</span>
          </div>
          <div className="flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-green-600 font-medium">Free Delivery</p>
          </div>
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
        <button className="w-1/2 border border-pink-600 text-pink-600 font-medium py-2.5 rounded-md mr-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
        <button className="w-1/2 bg-pink-600 text-white font-medium py-2.5 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default FlashSalePage;