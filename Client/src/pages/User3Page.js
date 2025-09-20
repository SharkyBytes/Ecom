import React, { useState, useEffect } from 'react';
import UserProfile from '../components/UserProfile';
import FlashSaleNotification from '../components/FlashSaleNotification';
import { useFlashSale } from '../hooks/useFlashSale';
import { MOCK_USERS } from '../services/mockData';

const User3Page = () => {
  const [user] = useState(MOCK_USERS.user3);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const { 
    flashSales, 
    loading, 
    error, 
    purchaseFlashSale, 
    dismissFlashSale,
    hasActiveFlashSales 
  } = useFlashSale('user3');

  // Get the first active flash sale for display
  const activeFlashSale = flashSales.length > 0 ? flashSales[0] : null;

  // Show notification when flash sale becomes available and keep it visible
  useEffect(() => {
    if (activeFlashSale) {
      // Auto-show notification for new flash sales and keep it visible
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [activeFlashSale?.id]); // Only trigger when flash sale ID changes

  // Handle flash sale purchase
  const handlePurchase = async () => {
    if (!activeFlashSale) return;

    try {
      const result = await purchaseFlashSale(activeFlashSale.id);
      
      if (result.success) {
        setPurchaseSuccess({
          productName: activeFlashSale.productName,
          price: activeFlashSale.discountedPrice,
          timestamp: new Date()
        });
        setShowNotification(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setPurchaseSuccess(null);
        }, 5000);
      } else {
        // Handle purchase failure - the error will be shown via the error state from useFlashSale
        setShowNotification(false);
        
        // Show a brief notification about the failure
        if (result.reason === 'RACE_CONDITION_LOST') {
          // Show a specific message for race condition losses
          console.log('Race condition detected - another user got there first');
        }
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      setShowNotification(false);
    }
  };

  // Handle dismissing flash sale notification (user chose "Maybe Later")
  const handleCloseNotification = () => {
    if (activeFlashSale) {
      dismissFlashSale(activeFlashSale.id);
    }
    setShowNotification(false);
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen-safe bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your personalized shopping dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Purchase Success Message */}
        {purchaseSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-medium">Purchase Successful!</span>
                <p className="text-sm text-green-600 mt-1">
                  You successfully purchased "{purchaseSuccess.productName}" for {formatPrice(purchaseSuccess.price)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* User Profile Section */}
          <div className="order-2 xl:order-1">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
              Profile Information
            </h2>
            <UserProfile user={user} />
          </div>

          {/* Flash Sale Status Section */}
          <div className="order-1 xl:order-2">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
              Flash Sale Alerts
            </h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {hasActiveFlashSales ? (
                <div className="text-center">
                  <div className="text-yellow-500 mb-4">
                    <svg className="w-12 h-12 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Flash Sale Available!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You have {flashSales.length} active flash sale{flashSales.length > 1 ? 's' : ''} available.
                  </p>
                  <button
                    onClick={() => setShowNotification(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Flash Sale
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Flash Sales</h3>
                  <p className="text-sm">
                    You'll be notified when flash sales matching your interests become available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Interests Section */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
            Your Interests
          </h2>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-block bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Flash sales will be shown for products in these categories that match your interests.
            </p>
          </div>
        </div>

        {/* How Flash Sales Work Section */}
        <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
            How Flash Sales Work
          </h3>
          <div className="text-blue-700 text-sm leading-relaxed space-y-2">
            <p>
              • When customers cancel orders, they become available as flash sales to nearby interested customers
            </p>
            <p>
              • Flash sales offer significant discounts and are available for a limited time
            </p>
            <p>
              • You'll only see flash sales for products that match your interests
            </p>
            <p>
              • Act fast - flash sales are first-come, first-served!
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

        {/* Flash Sale Notification */}
        {showNotification && activeFlashSale && (
          <FlashSaleNotification
            flashSale={activeFlashSale}
            onPurchase={handlePurchase}
            onClose={handleCloseNotification}
          />
        )}
      </div>
    </div>
  );
};

export default User3Page;