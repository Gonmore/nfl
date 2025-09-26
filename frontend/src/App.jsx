import React, { useState, useEffect } from 'react';
import LoginRegister from './LoginRegister.jsx';
import Dashboard from './Dashboard.jsx';


export default function App() {
  console.log('App component rendering');
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('jwt');
    console.log('Token from localStorage:', stored);
    return stored || null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    console.log('User from localStorage:', stored);
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Permite cerrar sesión
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  return (
    <div>
      <div style={{background: '#ff0', padding: 8, textAlign: 'center', fontWeight: 'bold'}}>DEBUG: App.jsx renderizado</div>
      {!token ? (
        <LoginRegister onLogin={handleLogin} />
      ) : (
        <>
          <button onClick={handleLogout} style={{position:'absolute',top:10,right:10,padding:8}}>Cerrar sesión</button>
          <Dashboard user={user} token={token} />
        </>
      )}
    </div>
  );
}
