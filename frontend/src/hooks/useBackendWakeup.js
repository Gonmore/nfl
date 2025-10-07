import { useState, useEffect, useRef } from 'react';
import { wakeup } from '../api';

/**
 * Hook personalizado para manejar el wake-up del backend
 * Monitorea el estado del backend y muestra animación si es necesario
 */
export const useBackendWakeup = () => {
  const [isBackendAwake, setIsBackendAwake] = useState(true);
  const [showWakeupAnimation, setShowWakeupAnimation] = useState(false);
  const [wakeupError, setWakeupError] = useState(null);
  const wakeupAttempted = useRef(false);
  const wakeupTimeout = useRef(null);

  useEffect(() => {
    // Solo intentar wake-up una vez por sesión
    if (wakeupAttempted.current) return;

    const attemptWakeup = async () => {
      wakeupAttempted.current = true;
      
      // Timeout de 2 segundos - si no responde, mostrar animación
      wakeupTimeout.current = setTimeout(() => {
        setShowWakeupAnimation(true);
        setIsBackendAwake(false);
      }, 2000);

      try {
        const startTime = Date.now();
        await wakeup();
        const responseTime = Date.now() - startTime;
        
        // Si respondió rápido, no mostrar animación
        if (responseTime < 2000) {
          clearTimeout(wakeupTimeout.current);
          setShowWakeupAnimation(false);
        }
        
        setIsBackendAwake(true);
        setWakeupError(null);
        
        // Ocultar animación después de recibir respuesta
        setTimeout(() => {
          setShowWakeupAnimation(false);
        }, 1000);
      } catch (error) {
        console.error('Error waking up backend:', error);
        setWakeupError(error.message);
        setIsBackendAwake(false);
        // Mantener animación visible si hay error
        setShowWakeupAnimation(true);
      }
    };

    attemptWakeup();

    return () => {
      if (wakeupTimeout.current) {
        clearTimeout(wakeupTimeout.current);
      }
    };
  }, []);

  return {
    isBackendAwake,
    showWakeupAnimation,
    wakeupError
  };
};
