import React, { useState, useEffect, useRef } from 'react';
import LoginRegister from './LoginRegister.jsx';
import Dashboard from './Dashboard.jsx';
import LoadingModal from './LoadingModal.jsx';
import LoadingSequenceModal from './LoadingSequenceModal.jsx';
import { setGlobalLoadingSetter, wakeup } from './api.js';
import './App.css';
import './index.css';

export default function App() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('jwt');
    return stored || null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingSequence, setShowLoadingSequence] = useState(false);
  const [showLogin, setShowLogin] = useState(!token);

  // Session timeout management
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Activity events to track
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const resetInactivityTimeout = () => {
    lastActivityRef.current = Date.now();
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (token) {
      // 15 minutes = 15 * 60 * 1000 = 900000 ms
      inactivityTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, 900000);
    }
  };

  const handleActivity = () => {
    resetInactivityTimeout();
  };

  // Initialize global loading setter
  useEffect(() => {
    setGlobalLoadingSetter(setIsLoading);
  }, []);

  // Session timeout setup
  useEffect(() => {
    if (token) {
      resetInactivityTimeout();
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });
    } else {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [token]);

  // Wakeup call when showing login
  useEffect(() => {
    if (showLogin && !token) {
      wakeup().catch(err => {
        console.log('Wakeup call failed, but continuing:', err);
      });
    }
  }, [showLogin, token]);

  const handleLogin = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
    setShowLoadingSequence(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setShowLogin(true);
    setShowLoadingSequence(false);
  };

  const handleLoadingSequenceComplete = () => {
    setShowLoadingSequence(false);
  };

  return (
    <div className="container">
      <LoadingModal isVisible={isLoading} />
      {showLoadingSequence ? (
        <LoadingSequenceModal
          isVisible={showLoadingSequence}
          onComplete={handleLoadingSequenceComplete}
        />
      ) : showLogin ? (
        <LoginRegister onLogin={handleLogin} setIsLoading={setIsLoading} />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} setIsLoading={setIsLoading} />
      )}
    </div>
  );
}
