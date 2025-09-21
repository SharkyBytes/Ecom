import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      // Show the prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    // Hide the prompt
    setShowPrompt(false);
    
    // Show the install prompt
    if (installPrompt) {
      installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the saved prompt since it can't be used again
        setInstallPrompt(null);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 flex items-center justify-between border-t border-gray-200">
      <div>
        <h3 className="font-bold text-meesho-dark">Install Flash Sale App</h3>
        <p className="text-sm text-gray-600">Get instant access to flash deals</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="meesho-button"
      >
        Install
      </button>
    </div>
  );
};

export default PWAInstallPrompt;