import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashSale } from '../hooks/useFlashSale';
import { MOCK_USERS } from '../services/mockData';
import { APP_CONFIG } from '../utils/constants';

const logoUrl = "https://www.meesho.com/assets/svgicons/meeshoLogo.svg";

function FlashSaleTopBar({ onBackToHome, flashSalesCount, currentIndex }) {
    return (
        <div className="bg-white shadow-md border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <img
                            src={logoUrl}
                            alt="Meesho"
                            className="h-7 w-auto"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="text-2xl font-extrabold text-fuchsia-800" style={{ display: 'none' }}>
                            Meesho
                        </div>
                        <div className="text-fuchsia-800 font-semibold text-base">
                            ⚡ Flash Sale
                            {flashSalesCount > 1 && (
                                <span className="ml-2 text-xs bg-fuchsia-100 px-2 py-1 rounded-full">
                                    {currentIndex} of {flashSalesCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onBackToHome}
                        className="text-sm text-gray-600 hover:text-fuchsia-800 underline"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
}

function FlashSaleTimer({ timeLeft }) {
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`text-center py-2 border-b ${timeLeft > 0 ? 'bg-fuchsia-50 text-fuchsia-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center justify-center space-x-2 text-sm">
                <span>{timeLeft > 0 ? '⏰' : '❌'}</span>
                <span className="font-medium">
                    {timeLeft > 0 ? 'Flash Sale ends in' : 'Flash Sale Status:'}
                </span>
                <span className={`text-lg font-mono font-bold ${timeLeft > 0 ? 'text-fuchsia-800' : 'text-red-800'}`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : 'Flash Sale is Over'}
                </span>
            </div>
        </div>
    );
}

function FlashSaleProductCard({ flashSale, onPurchase, isLoading, timeLeft }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const calculateDiscount = () => {
        const discount = ((flashSale.originalPrice - flashSale.discountedPrice) / flashSale.originalPrice) * 100;
        return Math.round(discount);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-fuchsia-800 to-fuchsia-900 text-white text-center py-2 text-sm font-semibold">
                ⚡ Flash Sale Exclusive
            </div>
            <div className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={flashSale.image}
                                alt={flashSale.productName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-900 mb-2">
                            {flashSale.productName}
                        </h1>
                        <div className="mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-fuchsia-800">
                                    {formatPrice(flashSale.discountedPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(flashSale.originalPrice)}
                                </span>
                            </div>
                            <div className="mt-1 inline-block bg-fuchsia-100 text-fuchsia-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {calculateDiscount()}% OFF
                            </div>
                        </div>
                        <button
                            onClick={() => timeLeft > 0 ? onPurchase(flashSale) : null}
                            disabled={isLoading || timeLeft === 0}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${isLoading || timeLeft === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-fuchsia-800 hover:bg-fuchsia-900 text-white shadow-md transition'
                                }`}
                        >
                            {isLoading
                                ? 'Processing...'
                                : timeLeft === 0
                                    ? 'Flash Sale Ended'
                                    : `Buy Now - ${formatPrice(flashSale.discountedPrice)}`
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FlashSalePage = () => {
    const [user] = useState(MOCK_USERS.user2);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);
    const [currentFlashSale, setCurrentFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();

    const {
        flashSales,
        loading,
        error,
        purchaseFlashSale
    } = useFlashSale('user2');

    useEffect(() => {
        if (flashSales.length > 0 && !purchaseInProgress && !currentFlashSale) {
            setCurrentFlashSale(flashSales[0]);
        } else if (flashSales.length > 0 && !purchaseInProgress && currentFlashSale) {
            const stillExists = flashSales.find(fs => fs.id === currentFlashSale.id);
            if (!stillExists) {
                setCurrentFlashSale(flashSales[0]);
            }
        }
    }, [flashSales, purchaseInProgress, currentFlashSale]);

    const activeFlashSale = currentFlashSale;

    // Timer management
    useEffect(() => {
        if (activeFlashSale) {
            const calculateTimeLeft = () => {
                const now = new Date().getTime();
                const expiry = new Date(activeFlashSale.expiresAt).getTime();
                const difference = expiry - now;
                return Math.max(0, Math.floor(difference / 1000));
            };

            setTimeLeft(calculateTimeLeft());

            const timer = setInterval(() => {
                const newTimeLeft = calculateTimeLeft();
                setTimeLeft(newTimeLeft);

                if (newTimeLeft <= 0) {
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [activeFlashSale]);

    const handlePurchase = async (flashSale) => {
        setPurchaseInProgress(true);

        try {
            const result = await purchaseFlashSale(flashSale.id);

            if (result.success) {
                setPurchaseSuccess({
                    productName: flashSale.productName,
                    price: flashSale.discountedPrice,
                    timestamp: new Date()
                });
                setCurrentFlashSale(null);
                setPurchaseInProgress(false);
                setTimeout(() => {
                    if (flashSales.length <= 1) {
                        setTimeout(() => {
                            navigate(APP_CONFIG.ROUTES.USER2);
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            setPurchaseSuccess(null);
                        }, 2000);
                    }
                }, 500);
            } else {
                setPurchaseInProgress(false);
            }
        } catch (err) {
            console.error('Purchase failed:', err);
            setPurchaseInProgress(false);
        }
    };

    const handleBackToHome = () => {
        navigate(APP_CONFIG.ROUTES.USER2);
    };

    const handleNextFlashSale = () => {
        if (flashSales.length > 1 && currentFlashSale) {
            const currentIndex = flashSales.findIndex(fs => fs.id === currentFlashSale.id);
            const nextIndex = (currentIndex + 1) % flashSales.length;
            setCurrentFlashSale(flashSales[nextIndex]);
            setPurchaseSuccess(null);
        }
    };

    const handlePrevFlashSale = () => {
        if (flashSales.length > 1 && currentFlashSale) {
            const currentIndex = flashSales.findIndex(fs => fs.id === currentFlashSale.id);
            const prevIndex = currentIndex === 0 ? flashSales.length - 1 : currentIndex - 1;
            setCurrentFlashSale(flashSales[prevIndex]);
            setPurchaseSuccess(null);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-fuchsia-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Flash Sale...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <FlashSaleTopBar
                onBackToHome={handleBackToHome}
                flashSalesCount={flashSales.length}
                currentIndex={currentFlashSale ? flashSales.findIndex(fs => fs.id === currentFlashSale.id) + 1 : 1}
            />

            {activeFlashSale && (
                <FlashSaleTimer timeLeft={timeLeft} />
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {purchaseSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                        🎉 You successfully purchased "{purchaseSuccess.productName}" for {formatPrice(purchaseSuccess.price)}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                {activeFlashSale && (
                    <div className="relative">
                        {flashSales.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevFlashSale}
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border p-2 rounded-full shadow"
                                    aria-label="Previous Flash Sale"
                                >
                                    ◀
                                </button>
                                <button
                                    onClick={handleNextFlashSale}
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border p-2 rounded-full shadow"
                                    aria-label="Next Flash Sale"
                                >
                                    ▶
                                </button>
                            </>
                        )}
                        <FlashSaleProductCard
                            flashSale={activeFlashSale}
                            onPurchase={handlePurchase}
                            isLoading={loading}
                            timeLeft={timeLeft}
                        />
                    </div>
                )}

                {!activeFlashSale && !loading && !purchaseInProgress && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-2">😔</div>
                        <h2 className="text-lg font-medium text-gray-700 mb-2">
                            No Flash Sales Available
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            All flash sales have ended. Check back soon for new deals!
                        </p>
                        <button
                            onClick={handleBackToHome}
                            className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white px-4 py-2 rounded-md text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashSalePage;