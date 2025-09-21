import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../utils/constants';

const FlashDealNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed top-20 left-0 right-0 mx-auto max-w-sm z-50 animate-bounce">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg rounded-lg overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold">Flash Deal Alert!</h3>
              <p className="text-white text-opacity-90">{notification.body}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-black bg-opacity-10 p-3 flex justify-between items-center">
            <div className="text-sm text-white text-opacity-90">
              Limited time offer! Expires in 48 hours
            </div>
            <Link 
              to={`${APP_CONFIG.ROUTES.FLASH_SALE}?id=${notification.flashDealId}`}
              className="bg-white text-pink-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-opacity-90"
            >
              View Deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashDealNotification;
