# 📋 Mobile App - Implementation Checklist

## 🎯 Fase 1: Setup Básico ✅ COMPLETADO

- [x] Crear estructura de carpetas
- [x] Configurar TypeScript
- [x] Integrar todas las APIs (25 endpoints)
- [x] Crear tipos TypeScript completos
- [x] Agregar constantes de equipos NFL (32 equipos)
- [x] Crear funciones auxiliares (helpers)
- [x] Sistema de wake-up para backend
- [x] Documentación completa

**Estado: 100% ✅**

---

## 🔐 Fase 2: Autenticación (PRÓXIMO)

### Setup
- [ ] Instalar AsyncStorage: `@react-native-async-storage/async-storage` ✅ (ya instalado)
- [ ] Crear AuthContext (`src/contexts/AuthContext.tsx`)
- [ ] Configurar persistencia de sesión

### Pantallas
- [ ] **LoginScreen** (`src/screens/auth/LoginScreen.tsx`)
  - [ ] Formulario de email/password
  - [ ] Botón de login
  - [ ] Link a RegisterScreen
  - [ ] Manejo de errores
  - [ ] Loading state

- [ ] **RegisterScreen** (`src/screens/auth/RegisterScreen.tsx`)
  - [ ] Formulario de username/email/password
  - [ ] Validaciones (email, username, password)
  - [ ] Botón de registro
  - [ ] Link a LoginScreen
  - [ ] Manejo de errores
  - [ ] Loading state

### Componentes
- [ ] **InputField** (`src/components/forms/InputField.tsx`)
  - [ ] Props: value, onChangeText, placeholder, secureTextEntry
  - [ ] Estilos consistentes
  - [ ] Error handling

- [ ] **Button** (`src/components/common/Button.tsx`)
  - [ ] Props: title, onPress, loading, disabled
  - [ ] Estilos (primary, secondary, danger)
  - [ ] Loading spinner

- [ ] **LoadingSpinner** (`src/components/common/LoadingSpinner.tsx`)
  - [ ] ActivityIndicator
  - [ ] Colores customizables

### Testing
- [ ] Probar login exitoso
- [ ] Probar login con credenciales incorrectas
- [ ] Probar registro exitoso
- [ ] Probar registro con email duplicado
- [ ] Verificar persistencia de sesión (cerrar y abrir app)

---

## 🏠 Fase 3: Dashboard y Picks

### Setup
- [ ] Instalar React Navigation
  ```bash
  npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
  npm install react-native-screens react-native-safe-area-context
  ```

### Navegación
- [ ] Crear Stack Navigator para Auth
- [ ] Crear Tab Navigator para Main App
- [ ] Configurar navegación condicional (Auth vs Main)
- [ ] Configurar headers personalizados

### Pantallas
- [ ] **DashboardScreen** (`src/screens/main/DashboardScreen.tsx`)
  - [ ] Cargar ligas del usuario
  - [ ] Mostrar semana actual
  - [ ] Lista de juegos de la semana
  - [ ] Navegación a PickFormScreen
  - [ ] Pull to refresh

- [ ] **PickFormScreen** (`src/screens/picks/PickFormScreen.tsx`)
  - [ ] Cargar juegos de la semana
  - [ ] Mostrar picks guardados
  - [ ] Permitir cambiar picks
  - [ ] Botón de guardar picks
  - [ ] Navegación entre semanas
  - [ ] Deshabilitar picks después del inicio del juego

### Componentes
- [ ] **GameCard** (`src/components/game/GameCard.tsx`)
  - [ ] Mostrar equipos (home vs away)
  - [ ] Mostrar fecha y hora
  - [ ] Mostrar score (si está disponible)
  - [ ] Indicador de juego en vivo
  - [ ] Estado del juego (scheduled, in_progress, final)

- [ ] **PickButton** (`src/components/picks/PickButton.tsx`)
  - [ ] Botón para seleccionar equipo
  - [ ] Estado: no seleccionado, seleccionado, correcto, incorrecto
  - [ ] Colores según estado
  - [ ] Deshabilitar después del inicio

- [ ] **TeamLogo** (`src/components/team/TeamLogo.tsx`)
  - [ ] Mostrar logo del equipo (imagen o SVG)
  - [ ] Fallback a código de equipo
  - [ ] Tamaños: small, medium, large

- [ ] **WeekSelector** (`src/components/navigation/WeekSelector.tsx`)
  - [ ] Botones para navegar entre semanas
  - [ ] Indicador de semana actual
  - [ ] Límite: semana 1 a 18

### Testing
- [ ] Probar carga de juegos
- [ ] Probar selección de picks
- [ ] Probar guardar picks
- [ ] Probar navegación entre semanas
- [ ] Verificar que no se puedan hacer picks después del inicio
- [ ] Probar pull to refresh

---

## 🏆 Fase 4: Ligas

### Pantallas
- [ ] **LeagueListScreen** (`src/screens/leagues/LeagueListScreen.tsx`)
  - [ ] Lista de ligas del usuario
  - [ ] Indicador de liga pública/privada
  - [ ] Navegación a LeagueDetailScreen
  - [ ] Botones: Crear Liga, Unirse a Liga
  - [ ] Pull to refresh

- [ ] **LeagueDetailScreen** (`src/screens/leagues/LeagueDetailScreen.tsx`)
  - [ ] Información de la liga (nombre, descripción, código)
  - [ ] Tab: Leaderboard
  - [ ] Tab: Miembros
  - [ ] Botón de compartir código
  - [ ] Navegación entre semanas

- [ ] **CreateLeagueScreen** (`src/screens/leagues/CreateLeagueScreen.tsx`)
  - [ ] Formulario: nombre, descripción, público/privado
  - [ ] Validaciones
  - [ ] Botón de crear
  - [ ] Mostrar código de invitación después de crear

- [ ] **JoinLeagueScreen** (`src/screens/leagues/JoinLeagueScreen.tsx`)
  - [ ] Input para código de invitación
  - [ ] Botón de unirse
  - [ ] Validación de código
  - [ ] Manejo de errores

### Componentes
- [ ] **LeagueCard** (`src/components/league/LeagueCard.tsx`)
  - [ ] Nombre de liga
  - [ ] Descripción
  - [ ] Número de miembros
  - [ ] Badge: público/privado
  - [ ] Navegación a detalle

- [ ] **InviteCodeDisplay** (`src/components/league/InviteCodeDisplay.tsx`)
  - [ ] Mostrar código grande
  - [ ] Botón de copiar
  - [ ] Botón de compartir

### Testing
- [ ] Probar crear liga
- [ ] Probar unirse a liga con código válido
- [ ] Probar unirse a liga con código inválido
- [ ] Probar ver detalles de liga
- [ ] Probar compartir código de invitación

---

## 📊 Fase 5: Leaderboard y Stats

### Pantallas
- [ ] **LeaderboardScreen** (`src/screens/stats/LeaderboardScreen.tsx`)
  - [ ] Tabla de posiciones
  - [ ] Navegación entre semanas
  - [ ] Indicador de posición del usuario
  - [ ] Ver picks de otros usuarios
  - [ ] Pull to refresh

- [ ] **StandingsScreen** (`src/screens/stats/StandingsScreen.tsx`)
  - [ ] Standings de NFL
  - [ ] Filtros: AFC/NFC, División
  - [ ] Ordenar por: wins, losses, percentage
  - [ ] Pull to refresh

- [ ] **UserPicksScreen** (`src/screens/picks/UserPicksScreen.tsx`)
  - [ ] Ver picks de un usuario específico
  - [ ] Mostrar juegos con picks
  - [ ] Indicadores: correcto/incorrecto
  - [ ] Avatar y equipo favorito del usuario

### Componentes
- [ ] **LeaderboardRow** (`src/components/leaderboard/LeaderboardRow.tsx`)
  - [ ] Ranking
  - [ ] Avatar del usuario
  - [ ] Username
  - [ ] Picks correctos / totales
  - [ ] Puntos
  - [ ] Navegación a picks del usuario

- [ ] **StandingRow** (`src/components/standings/StandingRow.tsx`)
  - [ ] Logo del equipo
  - [ ] Nombre del equipo
  - [ ] Wins, Losses, Ties
  - [ ] Win percentage

- [ ] **Avatar** (`src/components/user/Avatar.tsx`)
  - [ ] Mostrar profileImage si existe
  - [ ] Fallback a iniciales
  - [ ] Borde con color del equipo favorito
  - [ ] Tamaños: small, medium, large

### Testing
- [ ] Probar leaderboard de una liga
- [ ] Probar ver picks de otro usuario
- [ ] Probar standings de NFL
- [ ] Probar filtros de standings
- [ ] Verificar orden correcto en leaderboard

---

## 👤 Fase 6: Perfil

### Setup
- [ ] Instalar dependencias de imagen
  ```bash
  npm install expo-image-picker
  npm install expo-camera
  ```

### Pantallas
- [ ] **ProfileScreen** (`src/screens/profile/ProfileScreen.tsx`)
  - [ ] Avatar grande (editable)
  - [ ] Username (editable)
  - [ ] Email (no editable)
  - [ ] Equipo favorito (editable)
  - [ ] Botón de cambiar password
  - [ ] Botón de logout
  - [ ] Estadísticas del usuario

- [ ] **EditProfileScreen** (`src/screens/profile/EditProfileScreen.tsx`)
  - [ ] Formulario de edición
  - [ ] ImagePicker para avatar
  - [ ] TeamSelector para equipo favorito
  - [ ] Validaciones
  - [ ] Botón de guardar

- [ ] **ChangePasswordScreen** (`src/screens/profile/ChangePasswordScreen.tsx`)
  - [ ] Input: password actual
  - [ ] Input: nueva password
  - [ ] Input: confirmar password
  - [ ] Validaciones
  - [ ] Botón de cambiar

### Componentes
- [ ] **ImagePicker** (`src/components/forms/ImagePicker.tsx`)
  - [ ] Mostrar imagen actual
  - [ ] Botón: Tomar foto
  - [ ] Botón: Seleccionar de galería
  - [ ] Botón: Eliminar foto
  - [ ] Permisos de cámara/galería

- [ ] **TeamSelector** (`src/components/team/TeamSelector.tsx`)
  - [ ] Grid de 32 equipos
  - [ ] Búsqueda/filtro
  - [ ] Selección con highlight
  - [ ] Mostrar logo y nombre

- [ ] **UserStats** (`src/components/user/UserStats.tsx`)
  - [ ] Total de picks
  - [ ] Picks correctos
  - [ ] Precisión
  - [ ] Ligas activas

### Testing
- [ ] Probar cambiar avatar (cámara)
- [ ] Probar cambiar avatar (galería)
- [ ] Probar cambiar username
- [ ] Probar cambiar equipo favorito
- [ ] Probar cambiar password
- [ ] Probar logout
- [ ] Verificar permisos de cámara/galería

---

## 🎨 Fase 7: Polish y UX

### Mejoras Generales
- [ ] Splash screen personalizado
- [ ] Animaciones de transición entre pantallas
- [ ] Pull to refresh en todas las listas
- [ ] Loading skeletons (en lugar de spinners)
- [ ] Error boundaries
- [ ] Toast notifications (éxito/error)
- [ ] Confirmación antes de acciones destructivas

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Cache de datos (React Query o SWR)
- [ ] Debounce en búsquedas
- [ ] Infinite scroll en leaderboards
- [ ] Memoización de componentes pesados

### Accesibilidad
- [ ] Labels para screen readers
- [ ] Tamaños de texto ajustables
- [ ] Contraste de colores
- [ ] Navegación por teclado

### Offline Support (Opcional)
- [ ] Detección de conexión
- [ ] Cache de datos críticos
- [ ] Sincronización al reconectar
- [ ] Indicadores de estado offline

---

## 🚀 Fase 8: Testing y Deploy

### Testing
- [ ] Unit tests (Jest)
  - [ ] Helpers functions
  - [ ] API service
  - [ ] Componentes básicos

- [ ] Integration tests
  - [ ] Login flow
  - [ ] Pick flow
  - [ ] League creation flow

- [ ] E2E tests (Detox)
  - [ ] Happy path completo
  - [ ] Error scenarios

### Build
- [ ] Configurar app.json
  - [ ] App name: MVPicks
  - [ ] Bundle identifier
  - [ ] Version number
  - [ ] Splash screen
  - [ ] Icon

- [ ] Android
  - [ ] Generar keystore
  - [ ] Configurar build.gradle
  - [ ] Build APK
  - [ ] Build AAB para Play Store
  - [ ] Testing en diferentes dispositivos

- [ ] iOS
  - [ ] Configurar provisioning profiles
  - [ ] Build IPA
  - [ ] Testing en TestFlight
  - [ ] Preparar para App Store

### Deploy
- [ ] **Android**
  - [ ] Crear cuenta de Google Play Console
  - [ ] Screenshots y descripción
  - [ ] Política de privacidad
  - [ ] Subir AAB
  - [ ] Internal testing
  - [ ] Beta testing
  - [ ] Producción

- [ ] **iOS**
  - [ ] Crear cuenta de App Store Connect
  - [ ] Screenshots y descripción
  - [ ] Política de privacidad
  - [ ] Subir IPA
  - [ ] TestFlight
  - [ ] Review de Apple
  - [ ] Producción

---

## 🎁 Extras (Opcional)

### Notificaciones Push
- [ ] Configurar Firebase Cloud Messaging
- [ ] Notificaciones de juegos que comienzan
- [ ] Notificaciones de resultados
- [ ] Notificaciones de liga (nuevo miembro, etc.)

### Deep Linking
- [ ] Configurar URL schemes
- [ ] Links de invitación
- [ ] Links a juegos específicos
- [ ] Links a ligas

### Analytics
- [ ] Integrar Firebase Analytics
- [ ] Tracking de eventos clave
- - Login/Register
  - Picks guardados
  - Ligas creadas/unidas
  - Pantallas visitadas

### Monetización (si aplica)
- [ ] Integrar in-app purchases
- [ ] Subscripciones premium
- [ ] Ads (si es gratuita)

---

## 📊 Progress Tracker

### General
- ✅ Fase 1: Setup Básico - 100%
- ⬜ Fase 2: Autenticación - 0%
- ⬜ Fase 3: Dashboard y Picks - 0%
- ⬜ Fase 4: Ligas - 0%
- ⬜ Fase 5: Leaderboard - 0%
- ⬜ Fase 6: Perfil - 0%
- ⬜ Fase 7: Polish - 0%
- ⬜ Fase 8: Deploy - 0%

### Pantallas (0 / 15)
- ⬜ LoginScreen
- ⬜ RegisterScreen
- ⬜ DashboardScreen
- ⬜ PickFormScreen
- ⬜ LeagueListScreen
- ⬜ LeagueDetailScreen
- ⬜ CreateLeagueScreen
- ⬜ JoinLeagueScreen
- ⬜ LeaderboardScreen
- ⬜ StandingsScreen
- ⬜ UserPicksScreen
- ⬜ ProfileScreen
- ⬜ EditProfileScreen
- ⬜ ChangePasswordScreen
- ⬜ InvitationScreen

### Componentes (0 / 20)
- ⬜ Button
- ⬜ InputField
- ⬜ LoadingSpinner
- ⬜ GameCard
- ⬜ PickButton
- ⬜ TeamLogo
- ⬜ WeekSelector
- ⬜ LeagueCard
- ⬜ InviteCodeDisplay
- ⬜ LeaderboardRow
- ⬜ StandingRow
- ⬜ Avatar
- ⬜ ImagePicker
- ⬜ TeamSelector
- ⬜ UserStats
- ⬜ ErrorAlert
- ⬜ SuccessToast
- ⬜ ConfirmDialog
- ⬜ EmptyState
- ⬜ SearchBar

---

## 💡 Tips de Implementación

1. **Comenzar con lo básico:** Login/Register primero
2. **Reutilizar componentes:** Crear componentes base antes de las pantallas
3. **Testing continuo:** Probar cada feature al completarla
4. **Git commits frecuentes:** Commit después de cada feature completada
5. **Seguir la guía de estilo:** Mantener código consistente
6. **Usar TypeScript:** Aprovechar los tipos para evitar errores
7. **Manejar errores:** Try/catch en todas las APIs
8. **Loading states:** Siempre mostrar feedback al usuario
9. **Responsive design:** Probar en diferentes tamaños de pantalla
10. **Optimizar renders:** Usar memo, useMemo, useCallback cuando sea necesario

---

## 🎯 Next Action

**AHORA:** Comenzar Fase 2 - Autenticación

1. Crear `src/contexts/AuthContext.tsx`
2. Crear `src/screens/auth/LoginScreen.tsx`
3. Crear `src/screens/auth/RegisterScreen.tsx`
4. Crear componentes básicos (Button, InputField)
5. Probar login/register

**Documentación de referencia:**
- `API_USAGE_EXAMPLES.tsx` - Ejemplos de uso de APIs
- `MOBILE_API_REFERENCE.md` - Referencia completa de APIs
- `MOBILE_GUIDE.md` - Guía de desarrollo

¡Vamos! 🚀🏈
