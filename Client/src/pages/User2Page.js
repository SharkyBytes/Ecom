import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import FlashDealNotification from '../components/FlashDealNotification';
import { APP_CONFIG, BANNERS } from '../utils/constants';
import { OFFER_ITEMS } from '../utils/offerData';
import { subscribeToNotifications } from '../services/socket';

const User2Page = () => {
  const [flashDeals, setFlashDeals] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);
  
  // User 2 is the Delhi user
  const userId = APP_CONFIG.MOCK_DATA.USER_IDS.DELHI_USER;
  
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    // Subscribe to notifications for this user
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      console.log('Received notification in User2Page:', notification);
      
      // Add to flash deals
      setFlashDeals(prev => [notification, ...prev]);
      
      // Show notification banner
      setLatestNotification(notification);
      setShowNotification(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    });
    
    return () => {
      unsubscribe();
    };
  }, [userId]);
  
  // Categories
  const categories = [
    { name: 'Categories', icon: 'https://cdn-icons-png.freepik.com/512/8634/8634546.png' },
    { name: 'Kurti & Dresses', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtt_Bc7yrj0qkFGzCV-LfpIG7O9Z-d5BnKpw&s' },
    { name: 'Kids & Toys', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQOfs5F-tgufd7Ztcp34EkILFdQr2MlvC6cw&s' },
    { name: 'Westernwear', icon: 'https://www.creaseindia.com/cdn/shop/files/sea-green-Indo-Western-outfit-for-men-indian-ethnicwear2.jpg?v=1742020216&width=1946' },
    { name: 'Home', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnAcIApTptEZQMXvBTOd-pKVJrrOBrKMEy1A&s' },
    { name: 'Men Clothing', icon: 'https://i.pinimg.com/564x/85/22/34/8522346c05525356198706df30c7ebe0.jpg' }
  ];
  
  return (
    <div className="bg-gray-100 min-h-screen pb-16">
      <Header title="Meesho" />
      
      {/* User Identifier */}
      <div className="bg-pink-100 text-pink-600 px-4 py-2 text-center">
        <span className="font-medium">User 2 (Delhi)</span>
      </div>
      
      {/* Flash Deal Notification */}
      {showNotification && latestNotification && (
        <FlashDealNotification 
          notification={latestNotification} 
          onClose={() => setShowNotification(false)} 
        />
      )}
      
      {/* Location Bar */}
      <div className="bg-white p-3 flex items-center text-sm border-b border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-meesho-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-gray-600">Add delivery location to check extra discount</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-meesho-secondary ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      {/* Categories */}
      <div className="bg-white py-4 overflow-x-auto">
        <div className="flex px-4 space-x-6">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-col items-center space-y-1 min-w-[64px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-pink-100">
                <img 
                  src={category.icon} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-center font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Carousel Banner */}
      <div className="p-4">
        <Carousel images={BANNERS} />
      </div>
      
      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-meesho-secondary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Flash Deals
            </h2>
            <Link to={APP_CONFIG.ROUTES.FLASH_SALE} className="text-sm font-medium text-meesho-secondary">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {flashDeals.map((deal, index) => (
              <Link 
                key={index} 
                to={`${APP_CONFIG.ROUTES.FLASH_SALE}?id=${deal.flashDealId}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <img 
                    src="/assets/images/blue_kurti.png" 
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-pink-600 text-white px-2 py-1 text-xs font-bold uppercase">
                    Flash Deal
                  </div>
                  <div className="absolute bottom-0 right-0 bg-pink-600 text-white px-2 py-1 text-xs font-bold">
                    {deal.body.match(/\((\d+)% off\)/)[1]}% OFF
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 truncate">Cotton Kurti Blue</h3>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center bg-green-500 text-white text-xs px-1 rounded">
                      <span>4.2</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">128 Reviews</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-pink-600">₹{parseFloat(deal.body.match(/₹(\d+\.\d+)/)[1])}</span>
                      <span className="text-xs text-gray-500 line-through ml-1">₹899.99</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded-sm">
                      Free Delivery
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires in 2 days
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Offer Zone */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-meesho-secondary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 112.76 3.77c.08.84.12 1.7.12 2.57V8" />
            </svg>
            Recently Viewed
          </h2>
          <span className="text-sm font-medium text-meesho-secondary">
            VIEW ALL
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {OFFER_ITEMS.map((item) => (
            <div key={item.id} className="relative rounded-lg overflow-hidden bg-orange-50 shadow">
              <div className="absolute top-0 left-0 bg-pink-600 text-white text-xs font-bold p-1">
                
              </div>
              <div className="p-2 flex flex-col justify-between h-32">
                
                <div className="w-full h-25 overflow-hidden rounded-md">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="text-xs mt-1 text-center font-medium">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <div className="flex flex-col items-center text-pink-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs">Categories</span>
        </div>
        <Link to={APP_CONFIG.ROUTES.CANCEL_ORDER} className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs">Orders</span>
        </Link>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Help</span>
        </div>
        <div className="flex flex-col items-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Account</span>
        </div>
      </div>
    </div>
  );
};

export default User2Page;