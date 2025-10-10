# MVPicks Mobile - React Native App

Aplicación móvil nativa de MVPicks para Android e iOS, construida con React Native y Expo.

## 🚀 Configuración Inicial

### Prerrequisitos

- Node.js 16+ instalado
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Para Android: Android Studio con emulador configurado
- Para iOS: Xcode instalado (solo macOS)

### Instalación

```bash
cd mobile
npm install
```

### Configuración de API

Edita `src/services/api.ts` y actualiza la IP local en modo desarrollo:

```typescript
const API_URL = __DEV__
  ? 'http://TU_IP_LOCAL:5001/api'  // Cambia TU_IP_LOCAL por tu IP (ej: 192.168.1.100)
  : 'https://api.mvpicks.com/api';  // URL de producción
```

Para obtener tu IP local:
- **Windows**: `ipconfig` (busca IPv4)
- **Mac/Linux**: `ifconfig` o `ip addr`

⚠️ **Importante**: No uses `localhost` o `127.0.0.1` - el emulador/dispositivo necesita tu IP real de la red.

## 📱 Ejecución

### Iniciar el servidor Expo

```bash
npm start
```

Se abrirá el navegador con Expo DevTools.

### Android

```bash
npm run android
```

O presiona `a` en la terminal de Expo.

### iOS (solo macOS)

```bash
npm run ios
```

O presiona `i` en la terminal de Expo.

### Web (para pruebas rápidas)

```bash
npm run web
```

## 📂 Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/          # Pantallas principales
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LeagueDetailScreen.tsx
│   │   └── PicksScreen.tsx
│   └── services/
│       └── api.ts        # Cliente API con JWT
├── App.tsx               # Entrada principal + navegación
├── app.json              # Configuración de Expo
├── package.json
└── tsconfig.json
```

## 🔑 Características Principales

### Autenticación
- Login con email/password
- Token JWT almacenado en AsyncStorage
- Auto-logout en errores 401

### Pantallas
1. **Login**: Autenticación de usuario
2. **Dashboard**: Lista de ligas del usuario
3. **League Detail**: Clasificación y partidos de la semana
4. **Picks**: Selección de ganadores por semana

### Navegación
- Stack Navigator (React Navigation)
- Headers personalizados con branding MVPicks
- Navegación back button nativa

## 🎨 Branding

- **Color Principal**: #002C5F (azul MVP)
- **Fuentes**: System default (San Francisco en iOS, Roboto en Android)
- **Logo**: Placeholder (reemplazar con assets reales)

## 🔧 Desarrollo

### Modo Desarrollo

Expo usa hot reload - los cambios se reflejan automáticamente.

### Logs y Debugging

```bash
# Logs de Android
npm run android -- --no-install --verbose

# Logs de iOS
npm run ios -- --no-install --verbose

# React Native Debugger
# Presiona 'd' en la terminal Expo > "Debug"
```

### Limpiar cache

```bash
expo start -c
```

## 📦 Build para Producción

### Android APK

```bash
expo build:android -t apk
```

### iOS App Store

```bash
expo build:ios
```

## 🐛 Solución de Problemas

### Error de conexión API

- Verifica que el backend esté corriendo en el puerto 5001
- Confirma que la IP en `api.ts` sea correcta
- Desactiva el firewall temporalmente si bloquea conexiones

### Módulos no encontrados

```bash
rm -rf node_modules
npm install
```

### Error de compilación TypeScript

Los errores de TypeScript son normales antes de `npm install`. Si persisten:

```bash
npm install --save-dev @types/react @types/react-native
```

### Expo no detecta el dispositivo

- Asegúrate de que el dispositivo y PC estén en la misma red WiFi
- Escanea el código QR con la app Expo Go

## 📱 Testing en Dispositivo Real

1. Instala **Expo Go** desde Play Store o App Store
2. Ejecuta `npm start`
3. Escanea el código QR con:
   - Android: App Expo Go
   - iOS: Cámara nativa

## 🚀 Próximos Pasos

- [ ] Añadir iconos de equipos NFL
- [ ] Implementar splash screen personalizado
- [ ] Añadir notificaciones push
- [ ] Modo offline con sincronización
- [ ] Estadísticas avanzadas
- [ ] Chat entre miembros de liga

## 📄 Licencia

Mismo que el proyecto principal MVPicks.
