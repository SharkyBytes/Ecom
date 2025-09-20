import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { APP_CONFIG } from './utils/constants';
import User1Page from './pages/User1Page';
import User2Page from './pages/User2Page';
import User3Page from './pages/User3Page';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-white">
        {/* PWA Safe Area for devices with notches */}
        <div className="min-h-screen bg-white" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Routes>
            <Route path={APP_CONFIG.ROUTES.USER1} element={<User1Page />} />
            <Route path={APP_CONFIG.ROUTES.USER2} element={<User2Page />} />
            <Route path={APP_CONFIG.ROUTES.USER3} element={<User3Page />} />
          </Routes>
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </div>
      </div>
    </Router>
  );
}

export default App;
