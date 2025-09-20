import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FlashSaleNotification = ({ flashSale, onPurchase, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (flashSale) {
      setIsVisible(true);
      // Calculate initial time left
      const now = new Date().getTime();
      const expiresAt = new Date(flashSale.expiresAt).getTime();
      const initialTimeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(initialTimeLeft);
    } else {
      setIsVisible(false);
    }
  }, [flashSale]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && flashSale) {
      // Flash sale expired
      setTimeout(() => {
        handleClose();
      }, 1000);
    }
  }, [timeLeft, flashSale]);

  const handlePurchase = async () => {
    if (onPurchase && !isLoading) {
      setIsLoading(true);
      try {
        const result = await onPurchase();
        
        if (result && result.success) {
          // Close notification after successful purchase
          handleClose();
        } else {
          // Purchase failed - the notification will be closed by the parent component
          // which will handle showing the appropriate error message
        }
      } catch (error) {
        console.error('Purchase error in notification:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!flashSale) return 0;
    const discount = ((flashSale.originalPrice - flashSale.discountedPrice) / flashSale.originalPrice) * 100;
    return Math.round(discount);
  };

  if (!flashSale) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Notification Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-yellow-400 overflow-hidden">
          {/* Header with Flash Sale Badge */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 sm:px-6 py-3 sm:py-4 relative">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">⚡ FLASH SALE!</h3>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="mt-2 flex items-center justify-center">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                <div className="flex items-center space-x-2 text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono text-lg font-bold">
                    {timeLeft > 0 ? formatTime(timeLeft) : 'EXPIRED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="p-4 sm:p-6">
            <div className="flex space-x-3 sm:space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={flashSale.image}
                  alt={flashSale.productName}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    // Create a simple colored rectangle with the first letter as fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = 80;
                    canvas.height = 80;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill background with primary color
                    ctx.fillStyle = '#b282a4';
                    ctx.fillRect(0, 0, 80, 80);
                    
                    // Add text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(flashSale.productName.charAt(0).toUpperCase(), 40, 40);
                    
                    e.target.src = canvas.toDataURL();
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-bold text-black mb-2">{flashSale.productName}</h4>
                
                {/* Price Information */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(flashSale.discountedPrice)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(flashSale.originalPrice)}
                    </span>
                  </div>
                  <div className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                    {calculateDiscount()}% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Sale Message */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                🎯 A customer just cancelled this order! Grab it now at a special price!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {timeLeft > 0 ? (
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      🛒 BUY NOW - {formatPrice(flashSale.discountedPrice)}
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-4 px-6 rounded-lg bg-red-100 border border-red-300 text-center">
                  <span className="text-red-700 font-bold">⏰ Flash Sale Expired</span>
                </div>
              )}

              <button
                onClick={() => {
                  handleClose();
                }}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Urgency Indicators */}
            {timeLeft > 0 && (
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Limited Time</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span>One Available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

FlashSaleNotification.propTypes = {
  flashSale: PropTypes.shape({
    orderId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    originalPrice: PropTypes.number.isRequired,
    discountedPrice: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    expiresAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired
  }),
  onPurchase: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

FlashSaleNotification.defaultProps = {
  flashSale: null
};

export default FlashSaleNotification;