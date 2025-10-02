import React, { useState, useEffect } from 'react';
import LoginRegister from './LoginRegister.jsx';
import Dashboard from './Dashboard.jsx';
import LoadingModal from './LoadingModal.jsx';
import { setGlobalLoadingSetter } from './api.js';
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

  // Initialize global loading setter
  useEffect(() => {
    setGlobalLoadingSetter(setIsLoading);
  }, []);

  const handleLogin = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  return (
    <div className="container">
      <LoadingModal isVisible={isLoading} />
      {!token ? (
        <LoginRegister onLogin={handleLogin} setIsLoading={setIsLoading} />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} setIsLoading={setIsLoading} />
      )}
    </div>
  );
}
