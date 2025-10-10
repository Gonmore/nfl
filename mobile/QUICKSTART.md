# 🎯 MVPicks Mobile - Guía Rápida

## ⚡ Inicio Rápido

1. **Instalar dependencias** (ya hecho ✅):
   ```bash
   npm install
   ```

2. **Backend configurado** (ya apunta a producción ✅):
   - URL: `https://nfl-backend-invn.onrender.com`
   - No necesitas configurar IP local
   - Funciona desde cualquier dispositivo/red

3. **Iniciar la app**:
   ```bash
   npm start
   ```

4. **Ejecutar en dispositivo**:
   - Presiona `a` para Android
   - Presiona `i` para iOS (solo macOS)
   - Escanea QR con Expo Go para dispositivo físico

## 📁 Archivos Clave

- `App.tsx` - Navegación principal
- `src/screens/` - Pantallas de la app
- `src/services/api.ts` - **Ya configurado con backend de producción**
- `src/components/TeamLogo.tsx` - Logos de equipos NFL (ESPN API)
- `assets/logo.png` - Logo de MVPicks

## 🔥 Comandos Útiles

```bash
# Limpiar cache
npm start -- -c

# Ver logs detallados
npm run android -- --verbose
npm run ios -- --verbose

# Reinstalar dependencias
rm -rf node_modules && npm install
```

## ⚠️ Problemas Comunes

### "Cannot connect to server"
- ✅ El backend es público, debería funcionar desde cualquier red
- ✅ Si falla, verifica tu conexión a internet
- ⚠️ Si el backend en Render está dormido, puede tardar ~30 seg en despertar

### Errores TypeScript en VS Code
- ✅ **Normal y esperado** - no afectan la ejecución
- Solución: `Ctrl+Shift+P > Reload Window`
- O cierra y abre VS Code
- La app funcionará perfectamente con `npm start`

### Módulos no encontrados
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎨 Personalización

### Cambiar colores del tema
Edita los colores en cada archivo de pantalla:
- `#002C5F` - Azul principal MVPicks
- `#F8F9FA` - Fondo gris claro

### Añadir logo
1. Agrega tu logo en `assets/logo.png`
2. Importa en `LoginScreen.tsx`:
   ```tsx
   import logo from '../../assets/logo.png';
   <Image source={logo} style={{width: 120, height: 120}} />
   ```

## 📱 Testing

### Emulador Android
```bash
npm run android
```

### Dispositivo Real
1. Instala "Expo Go" desde Play Store/App Store
2. Escanea el QR que aparece tras `npm start`

## 🚀 Estructura

```
LoginScreen -> DashboardScreen -> LeagueDetailScreen -> PicksScreen
    ↓              ↓                     ↓                  ↓
  Login      Lista Ligas         Clasificación        Hacer Picks
```

## ✨ Próximos Pasos Recomendados

1. ✅ Backend configurado (producción)
2. ✅ Logos de equipos integrados (ESPN API)
3. ✅ Logo de MVPicks añadido
4. 🚀 **Probar la app**: `npm start`
5. 📱 Instalar Expo Go y escanear QR
6. 🎨 Personalizar splash screen (opcional)
7. 📱 Configurar app icon personalizado (opcional)

---

**¿Qué es el Splash Screen?** Lee `SPLASH_SCREEN_INFO.md` para entenderlo.
