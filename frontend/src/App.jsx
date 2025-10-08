import React, { useState, useEffect, useRef } from 'react';
import LoginRegister from './LoginRegister.jsx';
import Dashboard from './Dashboard.jsx';
import RegisterWithInvitation from './RegisterWithInvitation.jsx';
import LoadingModal from './LoadingModal.jsx';
import LoadingSequenceModal from './LoadingSequenceModal.jsx';
import NFLWakeupAnimation from './components/NFLWakeupAnimation.jsx';
import { useGlobalBackendWakeup } from './hooks/useGlobalBackendWakeup.js';
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
  const [showLoadingSequence, setShowLoadingSequence] = useState(false);
  const [showLogin, setShowLogin] = useState(!token);
  const [invitationToken, setInvitationToken] = useState(null);
  
  // Hook global de wakeup
  const { showWakeupAnimation, isBackendAwake, forceWakeup } = useGlobalBackendWakeup();

  // Session timeout management
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Activity events to track
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Detectar token de invitación en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invToken = urlParams.get('invitation');
    if (invToken) {
      setInvitationToken(invToken);
      setShowLogin(false);
      // Limpiar el parámetro de la URL sin recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  // Forzar wakeup cuando se muestra el login
  useEffect(() => {
    if (showLogin && !token && !isBackendAwake) {
      forceWakeup();
    }
  }, [showLogin, token, isBackendAwake]);

  const handleLogin = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    
    // Solo guardar datos básicos del usuario, NO la imagen (profileImage es muy grande)
    const userDataToStore = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      favoriteTeam: userData.favoriteTeam
      // NO guardamos profileImage porque es base64 y llena el localStorage
    };
    localStorage.setItem('user', JSON.stringify(userDataToStore));
    
    setShowLogin(false);
    setInvitationToken(null);
    // Immediately show loading sequence without delay
    setShowLoadingSequence(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setShowLogin(true);
    setShowLoadingSequence(false);
    setInvitationToken(null);
  };

  const handleLoadingSequenceComplete = () => {
    setShowLoadingSequence(false);
    setIsLoading(false); // Ensure no global loading is active
  };

  const handleInvitationRegisterSuccess = (jwt, userData, invitationData) => {
    // Guardar token y datos del usuario
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Mostrar mensaje de bienvenida
    alert(`¡Bienvenido ${userData.username}! Has sido agregado a la liga ${invitationData.leagueName} con ${invitationData.picksCount} picks pre-configurados.`);
    
    // Hacer login
    handleLogin(jwt, userData);
  };

  const handleInvitationCancel = () => {
    setInvitationToken(null);
    setShowLogin(true);
  };

  return (
    <div className="container">
      <LoadingModal isVisible={isLoading} />
      <NFLWakeupAnimation isVisible={showWakeupAnimation} />
      {showLoadingSequence ? (
        <LoadingSequenceModal
          isVisible={showLoadingSequence}
          onComplete={handleLoadingSequenceComplete}
        />
      ) : invitationToken ? (
        <RegisterWithInvitation
          invitationToken={invitationToken}
          onRegisterSuccess={handleInvitationRegisterSuccess}
          onCancel={handleInvitationCancel}
        />
      ) : showLogin ? (
        <LoginRegister onLogin={handleLogin} setIsLoading={setIsLoading} />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} setIsLoading={setIsLoading} />
      )}
    </div>
  );
}
