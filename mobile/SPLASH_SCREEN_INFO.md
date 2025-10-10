# 🎨 Splash Screen - Explicación

## ¿Qué es el Splash Screen?

El **Splash Screen** (pantalla de bienvenida) es la **primera imagen que ves cuando abres una app** en tu teléfono, justo antes de que cargue la interfaz principal.

### Ejemplo:
```
Tocas el ícono de MVPicks → Aparece el logo grande (2-3 segundos) → Se carga el Login
```

## ¿Para qué sirve?

1. **Branding**: Muestra tu logo mientras la app carga
2. **Profesional**: Todas las apps comerciales lo tienen
3. **Transición suave**: Oculta el tiempo de carga

## ¿Cómo funciona en React Native/Expo?

Expo ya incluye un splash screen automático configurado en `app.json`:

```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

## Estado actual en MVPicks Mobile

✅ **Ya está configurado** en `app.json` con:
- Fondo azul MVPicks (#002C5F)
- Se mostrará mientras la app carga

## Para personalizar el Splash Screen:

### Opción 1: Crear imagen de splash
```bash
# Crea una imagen 1242x2436 px con el logo de MVPicks
# Guárdala en: mobile/assets/splash.png
```

### Opción 2: Usar el logo existente (rápido)
Ya configurado en `app.json` - el sistema usará el ícono de la app

### Opción 3: Generador automático de Expo
```bash
npx expo install expo-splash-screen
```

## Configuración actual en app.json:

```json
{
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain", 
    "backgroundColor": "#002C5F"  // Azul MVPicks
  }
}
```

## ¿Necesitas cambiarlo?

**NO es urgente** - Expo usa valores por defecto profesionales. Puedes:
1. Dejarlo como está (fondo azul)
2. Crear una imagen personalizada más adelante
3. Por ahora, la app funcionará perfectamente sin splash personalizado

## Resumen:

- **Qué es**: Primera pantalla que se ve al abrir la app
- **Duración**: 1-3 segundos mientras carga
- **Estado**: Ya configurado con color azul MVPicks
- **Urgencia**: Baja - es estético, no funcional
