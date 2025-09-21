import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { APP_CONFIG } from '../utils/constants';
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
    { name: 'Categories', icon: '/category-icon.png' },
    { name: 'Kurti & Dresses', icon: '/kurti-icon.png' },
    { name: 'Kids & Toys', icon: '/toys-icon.png' },
    { name: 'Westernwear', icon: '/western-icon.png' },
    { name: 'Home', icon: '/home-icon.png' },
    { name: 'Men Clothing', icon: '/men-icon.png' }
  ];
  
  return (
    <div className="bg-gray-100 min-h-screen pb-16">
      <Header title="Meesho" />
      
      {/* User Identifier */}
      <div className="bg-meesho-light text-meesho-secondary px-4 py-2 text-center">
        <span className="font-medium">User 2 (Delhi)</span>
      </div>
      
      {/* Flash Deal Notification */}
      {showNotification && latestNotification && (
        <div className="fixed top-32 left-0 right-0 mx-auto max-w-sm bg-white shadow-meesho-lg rounded-lg overflow-hidden z-50 transform transition-transform duration-300 ease-in-out animate-bounce">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-meesho-light flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-meesho-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Flash Deal Available!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {latestNotification.body}
                </p>
                <div className="mt-2">
                  <Link 
                    to={`${APP_CONFIG.ROUTES.FLASH_SALE}?id=${latestNotification.flashDealId}`}
                    className="text-sm font-medium text-meesho-secondary hover:text-meesho-primary"
                  >
                    View Deal →
                  </Link>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => setShowNotification(false)}
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
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
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                {/* Placeholder for category icon */}
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              </div>
              <span className="text-xs text-center">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Banner */}
      <div className="p-4">
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src="https://images.meesho.com/images/marketing/1678691617864_1200.webp" 
            alt="Mega Blockbuster Sale"
            className="w-full h-auto"
          />
        </div>
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
                className="bg-white rounded-lg shadow-meesho overflow-hidden"
              >
                <div className="relative">
                  <img 
                    src="https://images.meesho.com/images/products/42944024/jvgnb_512.jpg" 
                    alt={deal.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 left-2 flash-deal-badge">
                    Flash Deal
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 truncate">Cotton Kurti Blue</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <span className="font-bold">₹{parseFloat(deal.body.match(/₹(\d+\.\d+)/)[1])}</span>
                      <span className="text-xs text-gray-500 line-through ml-1">₹899.99</span>
                    </div>
                    <span className="flash-deal-discount">
                      {deal.body.match(/\((\d+)% off\)/)[1]}% OFF
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Expires in 2 days
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
            Offer Zone
          </h2>
          <span className="text-sm font-medium text-meesho-secondary">
            VIEW ALL
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative rounded-lg overflow-hidden bg-orange-100">
              <div className="absolute top-0 left-0 bg-meesho-secondary text-white text-xs font-bold p-1">
                SALE
              </div>
              <div className="p-4 h-32 flex flex-col justify-between">
                <div className="text-xs font-bold">
                  FROM <br />₹99
                </div>
                <div className="w-full h-16 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <div className="flex flex-col items-center text-meesho-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
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