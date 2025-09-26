import React, { useState, useEffect } from 'react';
import LoginRegister from './LoginRegister.jsx';
import Dashboard from './Dashboard.jsx';
import './App.css';

export default function App() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('jwt');
    return stored || null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

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
    <div id="root">
      <div className="container">
        {!token ? (
          <LoginRegister onLogin={handleLogin} />
        ) : (
          <Dashboard user={user} token={token} />
        )}
      </div>
    </div>
  );
}
