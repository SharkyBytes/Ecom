import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ORDER_STATUS } from '../utils/constants';

const OrderDetails = ({ order, showCancelButton = false, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <p>No order information available</p>
        </div>
      </div>
    );
  }

  const handleCancel = async () => {
    if (onCancel && !isLoading) {
      setIsLoading(true);
      try {
        await onCancel();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.ACTIVE:
        return 'text-green-600 bg-green-50 border-green-200';
      case ORDER_STATUS.CANCELLED:
        return 'text-red-600 bg-red-50 border-red-200';
      case ORDER_STATUS.SOLD:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-primary border-opacity-30 overflow-hidden w-full max-w-2xl mx-auto">
      {/* Order Header */}
      <div className="bg-primary bg-opacity-5 px-4 sm:px-6 py-3 sm:py-4 border-b border-primary border-opacity-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary">Order Details</h3>
            <p className="text-xs sm:text-sm text-gray-600">Order ID: {order.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={order.image}
              alt={order.productName}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/150x150/b282a4/ffffff?text=${encodeURIComponent(order.productName.charAt(0))}`;
              }}
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold text-black mb-2">{order.productName}</h4>
            
            <div className="space-y-2">
              <div className="flex justify-center sm:justify-start items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="inline-block bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm font-medium">
                  {order.category}
                </span>
              </div>

              <div className="flex justify-center sm:justify-start items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <span className="text-black font-medium">{order.quantity}</span>
              </div>

              <div className="flex justify-center sm:justify-start items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Price:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order.price)}</span>
              </div>

              {order.discountedPrice && order.discountedPrice !== order.price && (
                <div className="flex justify-center sm:justify-start items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Flash Sale Price:</span>
                  <span className="text-lg font-bold text-green-600">{formatPrice(order.discountedPrice)}</span>
                  <span className="text-sm text-gray-500 line-through">{formatPrice(order.price)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        {order.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{order.description}</p>
          </div>
        )}

        {/* Order Metadata */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ordered:</span>
              <span className="ml-2 text-black">{formatDate(order.createdAt)}</span>
            </div>
            {order.cancelledAt && (
              <div>
                <span className="font-medium text-gray-700">Cancelled:</span>
                <span className="ml-2 text-black">{formatDate(order.cancelledAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Button */}
        {showCancelButton && order.status === ORDER_STATUS.ACTIVE && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </div>
              ) : (
                'Cancel Order'
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Cancelling this order will make it available as a flash sale to nearby customers
            </p>
          </div>
        )}

        {/* Cancelled Order Message */}
        {order.status === ORDER_STATUS.CANCELLED && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Order Cancelled</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                This order has been cancelled and offered as a flash sale
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OrderDetails.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discountedPrice: PropTypes.number,
    image: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    status: PropTypes.oneOf(Object.values(ORDER_STATUS)).isRequired,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    cancelledAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    description: PropTypes.string
  }),
  showCancelButton: PropTypes.bool,
  onCancel: PropTypes.func
};

OrderDetails.defaultProps = {
  order: null,
  showCancelButton: false,
  onCancel: null
};

export default OrderDetails;