# 🎬 Sistema de Splash Screen Inteligente - MVPicks Mobile

## 🎯 ¿Qué Problema Resuelve?

Render (free tier) **duerme los servidores** tras 15 minutos de inactividad. Despertar puede tardar **30-45 segundos**, lo que daría una mala experiencia de usuario si solo ve una pantalla de carga.

## ✨ Solución Implementada

Un **splash screen animado** que:
1. **Detecta automáticamente** si el backend está dormido
2. **Solo se muestra** si es necesario (backend dormido)
3. **Entretiene** al usuario con animación de logos NFL
4. **Informa** del progreso con barra y mensaje
5. **Despierta** el backend en segundo plano

## 🔄 Flujo de Funcionamiento

### Escenario 1: Backend Despierto ✅
```
Usuario abre app
    ↓
App.tsx llama initializeBackend()
    ↓
checkBackendStatus() hace ping a /api/awake
    ↓
Responde en <3 segundos
    ↓
showSplash = false
    ↓
Login screen cargado inmediatamente ✅
```

**Tiempo total**: ~2-3 segundos

### Escenario 2: Backend Dormido 💤
```
Usuario abre app
    ↓
App.tsx llama initializeBackend()
    ↓
checkBackendStatus() hace ping a /api/awake
    ↓
NO responde (timeout 3s)
    ↓
showSplash = true → Muestra NFLSplashScreen
    ↓
[Animación de logos NFL + Barra de progreso]
    ↓
wakeUpBackend() hace peticiones cada 3s
    ↓
Backend despierta (intento 8-12, ~30s)
    ↓
handleSplashFinish() llamado
    ↓
Splash desaparece → Login screen cargado ✅
```

**Tiempo total**: ~30-45 segundos (pero entretenido)

## 🎨 Componentes del Splash Screen

### 1. Animación de Logos NFL
```
15 imágenes (assets/carga/1.png a 15.png)
200ms por imagen
2 loops completos = 6 segundos total de animación
```

### 2. Mensaje Informativo
```
"Conectando con servidores NFL..."
Fuente: blanca, 18px, centrada
```

### 3. Barra de Progreso
```
Duración: 40 segundos (sincronizada)
0% → 100%
Color: blanco sobre fondo azul MVPicks
Texto: "X%" debajo de la barra
```

### 4. Logo MVPicks
```
Pequeño (100x100px)
Posición: abajo centro
Opacidad: sutilmente presente
```

## 🛠️ Archivos Involucrados

### App.tsx
```typescript
// Estado
const [isLoading, setIsLoading] = useState(true);
const [showSplash, setShowSplash] = useState(false);

// Al iniciar
useEffect(() => {
  initializeApp();
}, []);

// Lógica
const initializeApp = async () => {
  const needsWakeup = await initializeBackend();
  
  if (needsWakeup) {
    setShowSplash(true); // Mostrar splash
  } else {
    setIsLoading(false); // Continuar directo
  }
};

// Renderizado condicional
if (showSplash) {
  return <NFLSplashScreen onFinish={handleSplashFinish} />;
}
```

### NFLSplashScreen.tsx
```typescript
// Props
interface NFLSplashScreenProps {
  onFinish: () => void; // Callback cuando termina
}

// Estados
const [currentImage, setCurrentImage] = useState(0); // 0-14
const [progress, setProgress] = useState(0); // 0-100
const [loops, setLoops] = useState(0); // 0-2

// Efectos
useEffect(() => {
  // 1. Animación de progreso (40s)
  Animated.timing(progressAnim, {
    toValue: 100,
    duration: 40000,
  }).start();
  
  // 2. Secuencia de imágenes (200ms)
  const imageInterval = setInterval(() => {
    setCurrentImage((prev) => {
      const nextImage = (prev + 1) % 15;
      if (nextImage === 0) {
        setLoops((prevLoops) => prevLoops + 1);
        if (prevLoops >= 2) {
          clearInterval(imageInterval);
          onFinish(); // Terminar después de 2 loops
        }
      }
      return nextImage;
    });
  }, 200);
}, []);
```

### backendWakeup.ts
```typescript
// Funciones principales

export const checkBackendStatus = async (): Promise<boolean> => {
  // Timeout: 3 segundos
  // Endpoint: /api/awake (o /api/games como fallback)
  // Return: true si responde rápido, false si dormido
};

export const wakeUpBackend = async (): Promise<void> => {
  // Máximo: 15 intentos
  // Delay: 3 segundos entre intentos
  // Endpoint: /api/awake (o /api/games)
  // Return: cuando responda o termine intentos
};

export const initializeBackend = async (): Promise<boolean> => {
  // Return: true si necesitó despertar, false si ya estaba despierto
};
```

## 🎬 Línea de Tiempo

```
Tiempo | Backend Dormido                  | Backend Despierto
-------|----------------------------------|-------------------
0s     | Ping /api/awake                  | Ping /api/awake
       | (no responde)                    | (responde)
-------|----------------------------------|-------------------
3s     | Timeout → Mostrar splash         | Login cargado ✅
       | Logo 1/15 visible                |
-------|----------------------------------|-------------------
6s     | Logo 15/15 (loop 1 completo)     |
       | Intento 2 de wake-up             |
-------|----------------------------------|-------------------
12s    | Loop 2 iniciado                  |
       | Intento 4 de wake-up             |
       | Progreso: 30%                    |
-------|----------------------------------|-------------------
30s    | Backend responde! ✅              |
       | Progreso: 75%                    |
       | handleSplashFinish() llamado     |
-------|----------------------------------|-------------------
30.3s  | Splash fade out                  |
       | Login cargado ✅                  |
```

## 📊 Ventajas de Este Enfoque

| Aspecto | Solución Anterior | Solución Actual |
|---------|-------------------|-----------------|
| **UX** | "Loading..." 40s | Animación entretenida |
| **Feedback** | Ninguno | Barra de progreso + mensaje |
| **Percepción** | Parece congelado | Se ve activo |
| **Branding** | Genérico | Logos NFL + MVPicks |
| **Inteligencia** | Siempre espera | Solo si necesario |

## 🚀 Optimizaciones Implementadas

### 1. Detección Rápida
- **Timeout agresivo**: 3 segundos
- **Decisión rápida**: Backend despierto vs dormido

### 2. Wake-up Eficiente
- **Múltiples intentos**: 15 máximo
- **Delay razonable**: 3s entre intentos
- **Fallback**: Si /api/awake no existe, usa /api/games

### 3. Sincronización Visual
- **Animación**: Independiente del backend
- **Progreso**: Simulado a 40s
- **Finalización**: Al primer éxito o 2 loops completos

### 4. Experiencia Fluida
- **No bloquea**: App sigue funcional
- **Callback limpio**: onFinish() cuando termina
- **Estado compartido**: isLoading + showSplash

## 🔧 Configuración

### Ajustar tiempos
```typescript
// backendWakeup.ts
const WAKE_UP_TIMEOUT = 3000; // Detección inicial
const maxAttempts = 15;       // Intentos máximos
const delayBetweenAttempts = 3000; // Entre intentos

// NFLSplashScreen.tsx
duration: 40000,  // Duración de barra de progreso
200,              // Velocidad de animación (ms por imagen)
loops >= 2        // Cuántos loops antes de terminar
```

### Cambiar imágenes
Reemplaza `assets/carga/1.png a 15.png` con tus propias imágenes.

### Modificar mensaje
```typescript
<Text style={styles.message}>Tu mensaje aquí</Text>
```

## ✅ Testing

### Test 1: Backend Despierto
```bash
# Backend activo
npm start
# Resultado esperado: Login inmediato (<3s)
```

### Test 2: Backend Dormido
```bash
# Espera 20 minutos de inactividad en Render
npm start
# Resultado esperado: Splash animado (~30-45s)
```

### Test 3: Fallback
```bash
# Backend sin /api/awake
# Resultado esperado: Usa /api/games, splash funciona igual
```

## 📝 Resumen

✅ **Problema**: Backend tarda 30-45s en despertar  
✅ **Solución**: Splash screen animado + detección inteligente  
✅ **Resultado**: UX profesional, usuarios entretenidos  
✅ **Bonus**: Solo se muestra cuando es necesario  

**Tu app ahora tiene la misma experiencia que apps profesionales! 🎉**
