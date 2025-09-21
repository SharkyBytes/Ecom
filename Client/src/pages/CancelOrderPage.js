import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { APP_CONFIG, CANCELLATION_REASONS, PRODUCTS } from '../utils/constants';
import { cancelOrder } from '../services/api';

const CancelOrderPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Mock order data
  const order = {
    id: APP_CONFIG.MOCK_DATA.ORDER_ID,
    product: PRODUCTS.KURTI_BLUE,
    status: 'Confirmed',
    quantity: 1,
    orderDate: '18 Sep 2025',
    deliveryDate: '25 Sep 2025',
    paymentMethod: 'Prepaid',
    address: 'Mumbai, Maharashtra 400001',
    totalAmount: PRODUCTS.KURTI_BLUE.price,
    userId: APP_CONFIG.MOCK_DATA.USER_IDS.MUMBAI_USER
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for cancellation');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await cancelOrder(order.id, { 
        reason: selectedReason,
        additionalInfo 
      });
      
      setSuccess('Order cancelled successfully!');
      
      // // Redirect after a short delay
      // setTimeout(() => {
      //   // navigate(APP_CONFIG.ROUTES.USER2);
      // }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header title="My Orders" showBackButton={true} />
      
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* User Identifier */}
        <div className="bg-pink-100 text-pink-600 px-4 py-2 rounded-md mb-4 text-center">
          <span className="font-medium">User 1 (Mumbai)</span>
        </div>
        
        {/* Order Card */}
        <div className="bg-white rounded-lg shadow-meesho mb-4">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-gray-800">Order #{order.id.substring(0, 8)}</h2>
              <span className="text-sm text-pink-600 font-medium">{order.status}</span>
            </div>
            <p className="text-sm text-gray-500">Ordered on {order.orderDate} • Delivery by {order.deliveryDate}</p>
          </div>
          
          <div className="p-4 flex">
            <div className="w-24 h-28 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src="/assets/images/blue_kurti.png" 
                alt={order.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-medium text-gray-800">{order.product.name}</h3>
              <p className="text-sm text-gray-500">Size: Free Size • Qty: {order.quantity}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-bold">₹{order.product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-500">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivering to:</span>
              <span className="text-sm font-medium">{order.address}</span>
            </div>
          </div>
          
          {!showCancelForm && (
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => setShowCancelForm(true)}
                className="w-full border border-pink-600 text-pink-600 py-2 px-4 rounded-md font-medium hover:bg-pink-50 transition-colors"
              >
                Return/Cancel Order
              </button>
            </div>
          )}
        </div>
        
        {/* Cancel Form */}
        {showCancelForm && (
          <div className="bg-white rounded-lg shadow-meesho p-4">
            <h3 className="font-bold text-lg mb-4">Return/Cancel Order</h3>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleCancel}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select a reason for cancellation:
                </label>
                <div className="space-y-2">
                  {CANCELLATION_REASONS.map((reason) => (
                    <div key={reason.id} className="flex items-center">
                      <input
                        type="radio"
                        id={reason.id}
                        name="reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={() => setSelectedReason(reason.id)}
                        className="h-4 w-4 text-meesho-secondary focus:ring-meesho-secondary border-gray-300"
                      />
                      <label htmlFor={reason.id} className="ml-2 text-sm text-gray-700">
                        {reason.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Additional Information (Optional):
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-meesho-secondary focus:border-transparent"
                  rows="3"
                  placeholder="Please provide any additional details about your cancellation..."
                ></textarea>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowCancelForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 text-white py-2 px-4 rounded-md font-medium hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default CancelOrderPage;