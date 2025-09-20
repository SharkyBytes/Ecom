import React, { useState } from "react";
import { Link } from "react-router-dom";
import { APP_CONFIG } from "../utils/constants";
import { useFlashSale } from "../hooks/useFlashSale";

export default function CancelOrderPage() {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    const { createFlashSale, loading, error } = useFlashSale('user1');

    const handleCancelOrder = async () => {
        if (!reason) {
            alert("Please select a reason for cancellation");
            return;
        }

        setIsProcessing(true);

        try {
            // Create a mock order object based on the product being cancelled
            const cancelledOrder = {
                id: `order_${Date.now()}`,
                productName: "Men's Half T-shirt Cotton Blend (Pink A…)",
                category: "Fashion",
                price: 200,
                discountedPrice: 150, // 25% discount for flash sale
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&crop=center",
                quantity: 1,
                description: "Cotton blend half sleeve t-shirt in pink color, size XL",
                createdAt: new Date(),
                cancelledAt: new Date(),
                status: "cancelled"
            };

            // Create flash sale for users 2 and 3
            const availableForUsers = ['user2', 'user3'];
            const result = await createFlashSale(cancelledOrder, availableForUsers);

            if (result.success) {
                setCancelSuccess(true);
                setReason("");
                setDetails("");

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setCancelSuccess(false);
                }, 5000);
            } else {
                console.error('Failed to create flash sale:', result.error);
                alert('Order cancelled but failed to create flash sale notification');
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert('Failed to cancel order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            {/* Navigation Links */}

            {/* Success Message */}
            {cancelSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md w-full">
                    <div className="flex items-center space-x-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <span className="font-medium">Order Cancelled Successfully!</span>
                            <p className="text-sm text-green-600 mt-1">
                                Flash sale notifications have been sent to nearby customers.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
                    <div className="flex items-center space-x-2 text-red-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Error: {error}</span>
                    </div>
                </div>
            )}

            <div className="bg-white w-full max-w-md rounded-md border border-gray-200 shadow-sm">
                {/* Product Details */}
                <div className="flex items-start gap-3 p-4 border-b border-gray-200">
                    <img
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop&crop=center"
                        alt="Product"
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                            // Fallback to a colored rectangle with text if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div
                        className="w-16 h-16 bg-pink-200 rounded flex items-center justify-center text-pink-800 font-bold text-lg"
                        style={{ display: 'none' }}
                    >
                        T
                    </div>
                    <div className="flex flex-col text-sm">
                        <p className="font-medium text-gray-900 leading-snug">
                            Men's Half T-shirt Cotton Blend (Pink A…)
                        </p>
                        <p className="text-gray-600 text-sm mt-1">Size: XL • Qty: 1</p>
                        <p className="text-gray-900 text-sm font-medium mt-1">₹200</p>
                        <p className="text-gray-500 text-xs mt-1">All issues easy returns</p>
                    </div>
                </div>

                {/* Select reason */}
                <div className="px-4 mt-3">
                    <label className="text-sm font-medium text-gray-800">
                        Select reason for cancellation
                    </label>
                    <select
                        className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    >
                        <option value="">Select a reason</option>
                        <option value="delay">Delivery taking too long</option>
                        <option value="price">Found cheaper elsewhere</option>
                        <option value="mistake">Ordered by mistake</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Additional details */}
                <div className="px-4 mt-4">
                    <label className="text-sm font-medium text-gray-800">
                        Could you tell us a reason for canceling?
                    </label>
                    <textarea
                        className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        rows="4"
                        placeholder="Tell us more (optional)"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                </div>

                {/* Cancel button */}
                <div className="p-4">
                    <button
                        className={`w-full py-3 rounded-md font-semibold text-sm transition-colors ${isProcessing || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#9C27B0] hover:bg-[#7B1FA2] text-white'
                            }`}
                        onClick={handleCancelOrder}
                        disabled={isProcessing || loading}
                    >
                        {isProcessing || loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            'Cancel Product'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}