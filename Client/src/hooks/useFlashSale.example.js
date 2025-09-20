/**
 * Example usage of useFlashSale hook
 * This file demonstrates how to integrate the useFlashSale hook in components
 */

import React from 'react';
import { useFlashSale } from './useFlashSale';
import { MOCK_ORDERS } from '../services/mockData';

// Example component for User 1 (cancellation page)
export const User1Example = () => {
  const { createFlashSale, loading, error } = useFlashSale('user1');

  const handleCancelOrder = async () => {
    const orderData = MOCK_ORDERS.order1;
    const availableForUsers = ['user2', 'user3'];
    
    const result = await createFlashSale(orderData, availableForUsers);
    
    if (result.success) {
      console.log('Flash sale created successfully:', result.flashSaleId);
    } else {
      console.error('Failed to create flash sale:', result.error);
    }
  };

  return (
    <div>
      <h2>User 1 - Order Cancellation</h2>
      <button 
        onClick={handleCancelOrder} 
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Cancelling...' : 'Cancel Order'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

// Example component for User 2/3 (flash sale recipients)
export const User2Example = () => {
  const { 
    flashSales, 
    purchaseFlashSale, 
    dismissFlashSale, 
    loading, 
    error,
    hasActiveFlashSales,
    activeFlashSaleCount
  } = useFlashSale('user2');

  const handlePurchase = async (flashSaleId) => {
    const result = await purchaseFlashSale(flashSaleId);
    
    if (result.success) {
      console.log('Purchase successful!');
    } else {
      console.error('Purchase failed:', result.error);
    }
  };

  const handleDismiss = (flashSaleId) => {
    dismissFlashSale(flashSaleId);
  };

  return (
    <div>
      <h2>User 2 - Flash Sale Recipient</h2>
      
      <div className="mb-4">
        <p>Active Flash Sales: {activeFlashSaleCount}</p>
        <p>Has Flash Sales: {hasActiveFlashSales ? 'Yes' : 'No'}</p>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {flashSales.map(flashSale => (
        <div key={flashSale.id} className="border p-4 mb-4 rounded">
          <h3 className="font-bold">{flashSale.productName}</h3>
          <p>Original Price: ₹{flashSale.originalPrice}</p>
          <p>Discounted Price: ₹{flashSale.discountedPrice}</p>
          <p>Time Left: {Math.floor(flashSale.timeLeft / 1000)}s</p>
          
          <div className="mt-2">
            <button 
              onClick={() => handlePurchase(flashSale.id)}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Buy Now
            </button>
            <button 
              onClick={() => handleDismiss(flashSale.id)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {!hasActiveFlashSales && !loading && (
        <p>No active flash sales available.</p>
      )}
    </div>
  );
};

// Example of hook usage in a functional component
export const FlashSaleHookExample = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Flash Sale Hook Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <User1Example />
        <User2Example />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Hook Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Cross-tab communication for real-time updates</li>
          <li>Automatic flash sale expiration handling</li>
          <li>Race condition handling for simultaneous purchases</li>
          <li>User interest-based filtering</li>
          <li>Loading and error state management</li>
          <li>Cleanup on component unmount</li>
        </ul>
      </div>
    </div>
  );
};