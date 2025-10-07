import { useState, useEffect, useRef } from 'react';
import { wakeup } from '../api';

/**
 * Hook global para manejar el wake-up del backend desde cualquier pantalla
 * Detecta si el backend está dormido y muestra la animación NFL
 */
export const useGlobalBackendWakeup = () => {
  const [isBackendAwake, setIsBackendAwake] = useState(true);
  const [showWakeupAnimation, setShowWakeupAnimation] = useState(false);
  const [wakeupError, setWakeupError] = useState(null);
  const wakeupAttempted = useRef(false);
  const wakeupTimeout = useRef(null);
  const checkInterval = useRef(null);

  /**
   * Intenta despertar el backend
   */
  const attemptWakeup = async () => {
    if (wakeupAttempted.current) return;
    
    wakeupAttempted.current = true;
    
    // Si después de 3 segundos no hay respuesta, mostrar animación
    wakeupTimeout.current = setTimeout(() => {
      setShowWakeupAnimation(true);
      setIsBackendAwake(false);
    }, 3000);

    try {
      const startTime = Date.now();
      await wakeup();
      const responseTime = Date.now() - startTime;
      
      // Si respondió rápido (menos de 3s), no mostrar animación
      if (responseTime < 3000) {
        clearTimeout(wakeupTimeout.current);
        setShowWakeupAnimation(false);
      }
      
      setIsBackendAwake(true);
      setWakeupError(null);
      
      // Ocultar animación después de recibir respuesta
      setTimeout(() => {
        setShowWakeupAnimation(false);
      }, 1500);
    } catch (error) {
      console.error('Error waking up backend:', error);
      setWakeupError(error.message);
      setIsBackendAwake(false);
      setShowWakeupAnimation(true);
      
      // Reintentar después de 5 segundos
      setTimeout(() => {
        wakeupAttempted.current = false;
        attemptWakeup();
      }, 5000);
    }
  };

  /**
   * Verifica periódicamente si el backend sigue despierto
   */
  const startHealthCheck = () => {
    // Verificar cada 5 minutos si el backend está activo
    checkInterval.current = setInterval(async () => {
      try {
        await wakeup();
        setIsBackendAwake(true);
      } catch (error) {
        console.warn('Backend health check failed:', error);
        setIsBackendAwake(false);
        // No mostrar animación en checks periódicos, solo en llamadas activas
      }
    }, 5 * 60 * 1000); // 5 minutos
  };

  useEffect(() => {
    attemptWakeup();
    startHealthCheck();

    return () => {
      if (wakeupTimeout.current) {
        clearTimeout(wakeupTimeout.current);
      }
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  /**
   * Fuerza un wake-up manual (útil para llamadas API importantes)
   */
  const forceWakeup = async () => {
    if (!isBackendAwake) {
      setShowWakeupAnimation(true);
      try {
        await wakeup();
        setIsBackendAwake(true);
        setWakeupError(null);
        setTimeout(() => {
          setShowWakeupAnimation(false);
        }, 1500);
      } catch (error) {
        console.error('Force wakeup failed:', error);
        setWakeupError(error.message);
      }
    }
  };

  return {
    isBackendAwake,
    showWakeupAnimation,
    wakeupError,
    forceWakeup
  };
};
