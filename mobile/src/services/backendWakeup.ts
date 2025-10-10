import { wakeup } from './api';

const WAKE_UP_TIMEOUT = 5000; // 5 segundos para considerar que está dormido

/**
 * Intenta despertar el backend haciendo ping al endpoint /auth/wakeup
 * @returns {Promise<boolean>} true si responde rápido, false si está dormido
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    
    // Intentar hacer ping al backend usando el endpoint wakeup
    await wakeup();
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Backend respondió en ${responseTime}ms`);
    
    // Si responde en menos de 5 segundos, está despierto
    return responseTime < WAKE_UP_TIMEOUT;
  } catch (error) {
    console.log('❌ Backend está dormido, iniciando wake-up...');
    
    // Si falla o timeout, está dormido
    return false;
  }
};

/**
 * Despierta el backend y espera a que esté listo
 * Hace múltiples intentos hasta que responda
 */
export const wakeUpBackend = async (): Promise<void> => {
  const maxAttempts = 20; // 20 intentos
  const delayBetweenAttempts = 3000; // 3 segundos entre intentos
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxAttempts} de despertar backend...`);
      
      const response = await wakeup();
      
      if (response.message === 'Server is awake!') {
        console.log('✅ ¡Backend despierto y listo!');
        return;
      }
    } catch (error) {
      console.log(`❌ Intento ${attempt} falló, reintentando en 3s...`);
      
      // Esperar antes del siguiente intento
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  console.warn('⚠️ Backend tardó más de lo esperado (60s), pero continuando...');
};

/**
 * Inicializa la conexión con el backend
 * Primero verifica si está despierto, si no, lo despierta
 * @returns {Promise<boolean>} true si necesitó despertar, false si ya estaba despierto
 */
export const initializeBackend = async (): Promise<boolean> => {
  console.log('🚀 Inicializando conexión con backend...');
  const isAwake = await checkBackendStatus();
  
  if (!isAwake) {
    // Backend dormido, despertarlo
    console.log('😴 Backend dormido, despertando...');
    await wakeUpBackend();
    return true; // Necesitó despertar
  }
  
  console.log('✅ Backend ya estaba despierto');
  return false; // Ya estaba despierto
};
