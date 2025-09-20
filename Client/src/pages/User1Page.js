import { useState, useEffect } from 'react';
import UserProfile from '../components/UserProfile';
import OrderDetails from '../components/OrderDetails';
import { useFlashSale } from '../hooks/useFlashSale';
import { MOCK_USERS, getOrdersByUserId } from '../services/mockData';
import { ORDER_STATUS } from '../utils/constants';

const User1Page = () => {
  const [user] = useState(MOCK_USERS.user1);
  const [orders, setOrders] = useState([]);
  const [cancelledOrderId, setCancelledOrderId] = useState(null);
  const { createFlashSale, loading, error } = useFlashSale('user1');

  // Load user's orders on component mount
  useEffect(() => {
    const userOrders = getOrdersByUserId('user1');
    setOrders(userOrders);
  }, []);

  // Handle order cancellation
  const handleOrderCancel = async (order) => {
    try {
      // Update order status to cancelled
      const updatedOrders = orders.map(o => 
        o.id === order.id 
          ? { ...o, status: ORDER_STATUS.CANCELLED, cancelledAt: new Date() }
          : o
      );
      setOrders(updatedOrders);
      setCancelledOrderId(order.id);

      // Create flash sale for users 2 and 3
      const availableForUsers = ['user2', 'user3'];
      const result = await createFlashSale(order, availableForUsers);
      
      if (!result.success) {
        console.error('Failed to create flash sale:', result.error);
        // Optionally revert the order status if flash sale creation fails
        setOrders(orders);
        setCancelledOrderId(null);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      // Revert changes on error
      setOrders(orders);
      setCancelledOrderId(null);
    }
  };

  // Get the active order (first non-cancelled order)
  const activeOrder = orders.find(order => order.status === ORDER_STATUS.ACTIVE);
  const cancelledOrder = orders.find(order => order.id === cancelledOrderId);

  return (
    <div className="min-h-screen-safe bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
            My Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your profile and orders
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

        {/* Success Message for Cancellation */}
        {cancelledOrder && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Order cancelled successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your order has been cancelled and is now available as a flash sale to nearby customers.
            </p>
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

          {/* Order Details Section */}
          <div className="order-1 xl:order-2">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
              Current Order
            </h2>
            
            {activeOrder ? (
              <OrderDetails
                order={activeOrder}
                showCancelButton={true}
                onCancel={() => handleOrderCancel(activeOrder)}
              />
            ) : cancelledOrder ? (
              <OrderDetails
                order={cancelledOrder}
                showCancelButton={false}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Orders</h3>
                  <p className="text-sm">You don't have any active orders at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Processing cancellation...</span>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
            About Flash Sales
          </h3>
          <p className="text-blue-700 text-sm sm:text-base leading-relaxed">
            When you cancel an order, it becomes available as a flash sale to nearby customers who are interested in similar products. 
            This helps reduce waste and gives other customers a chance to get great deals on items you no longer need.
          </p>
        </div>
      </div>
    </div>
  );
};

export default User1Page;