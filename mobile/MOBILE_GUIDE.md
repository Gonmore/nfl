# 📱 MVPicks Mobile - Guía Completa

## ✅ Estado Actual: APIs COMPLETAS

**¡Todas las APIs del backend ya están integradas y listas para usar!**

La app móvil tiene **25 endpoints completamente funcionales** conectados al backend de producción en Render.

---

## 🎯 Características Implementadas

### Backend Integration ✅
- ✅ 25 APIs completamente funcionales
- ✅ Autenticación JWT con AsyncStorage
- ✅ Interceptor de axios para tokens automáticos
- ✅ Sistema de wake-up para backend en Render
- ✅ TypeScript types completos
- ✅ Constantes de equipos NFL (32 equipos)
- ✅ Utilidades y helpers

### Servicios Completados
```
✅ /src/services/api.ts           - 25 endpoints del backend
✅ /src/services/backendWakeup.ts - Sistema de wake-up
✅ /src/types/api.types.ts        - TypeScript types
✅ /src/constants/teams.ts        - Info de 32 equipos NFL
✅ /src/utils/helpers.ts          - Funciones auxiliares
```

---

## 📚 Documentación

### Archivos de Referencia
- **`MOBILE_API_REFERENCE.md`** - Documentación completa de todas las APIs
- **`README.md`** (este archivo) - Guía de desarrollo
- **`src/types/api.types.ts`** - Tipos TypeScript
- **`src/constants/teams.ts`** - Equipos NFL

---

## 🚀 Quick Start

### 1. Instalación
```bash
cd mobile
npm install
```

### 2. Iniciar App
```bash
npm start        # Iniciar Expo
npm run android  # Correr en Android
npm run ios      # Correr en iOS
```

### 3. Usar APIs

```typescript
import { loginUser, getGames, makePicks } from './src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Login
const response = await loginUser('email@example.com', 'password');
await AsyncStorage.setItem('jwt', response.token);

// Las siguientes peticiones ya incluyen el token automáticamente
const games = await getGames();
const picks = await makePicks(leagueId, { gameId1: teamId1, gameId2: teamId2 });
```

---

## 📖 APIs Disponibles (25 endpoints)

### 🔐 Auth (5 endpoints)
```typescript
loginUser(email, password)
registerUser(username, email, password)
updateProfile({ username?, password?, profileImage?, favoriteTeam? })
checkUserExists(email)
wakeup()
```

### 💌 Invitations (4 endpoints)
```typescript
validateInvitationToken(token)
registerWithInvitation(token, username, password)
createInvitationWithPicks(email, leagueId, picks)
addUserWithPicks(email, leagueId, picks)
```

### 🏆 Leagues (4 endpoints)
```typescript
getUserLeagues()
createLeague(name, description, isPublic)
joinLeague(inviteCode)
joinGeneralLeague()
```

### 🏈 Games (3 endpoints)
```typescript
getGames()
getGamesByWeek(week)
getAllGamesUntilWeek(week)
```

### 🎯 Picks (3 endpoints)
```typescript
getUserPicks(leagueId, week)
getUserPicksDetails(leagueId, week, userId?)
makePicks(leagueId, picks)
```

### 📊 Stats (3 endpoints)
```typescript
getLeagueStats(leagueId, week)
getStandings()
recalculateScores({ leagueId?, week?, allLeagues? })
```

**Ver `MOBILE_API_REFERENCE.md` para ejemplos detallados de cada endpoint.**

---

## 🏈 Equipos NFL

32 equipos disponibles con información completa en `src/constants/teams.ts`:

```typescript
import { NFL_TEAMS, getTeamInfo, getTeamFullName } from './src/constants/teams';

// Obtener info de equipo
const chiefs = getTeamInfo('KC');
console.log(chiefs.name);      // "Chiefs"
console.log(chiefs.city);      // "Kansas City"
console.log(chiefs.colors);    // { primary: '#E31837', secondary: '#FFB81C' }

// Nombre completo
const fullName = getTeamFullName('KC'); // "Kansas City Chiefs"
```

**Códigos de equipos:**
- AFC: BUF, MIA, NE, NYJ, BAL, CIN, CLE, PIT, HOU, IND, JAX, TEN, DEN, KC, LV, LAC
- NFC: DAL, NYG, PHI, WAS, CHI, DET, GB, MIN, ATL, CAR, NO, TB, ARI, LAR, SF, SEA

---

## 🔐 Autenticación

El sistema usa JWT tokens almacenados en AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './src/services/api';

// Login
const response = await loginUser(email, password);
await AsyncStorage.setItem('jwt', response.token);

// Las siguientes peticiones incluyen el token automáticamente
// gracias al interceptor de axios

// Logout
await AsyncStorage.removeItem('jwt');
```

---

## 🚀 Backend Wake-up (Importante!)

El backend está en **Render free tier** y duerme después de 15 minutos.

**Usar al inicio de la app:**

```typescript
import { initializeBackend } from './src/services/backendWakeup';

// En App.tsx
useEffect(() => {
  const wakeBackend = async () => {
    console.log('🚀 Iniciando backend...');
    const wasAsleep = await initializeBackend();
    if (wasAsleep) {
      console.log('✅ Backend despertado exitosamente');
    } else {
      console.log('✅ Backend ya estaba activo');
    }
  };
  
  wakeBackend();
}, []);
```

---

## 🎨 Próximas Pantallas a Implementar

### Prioridad Alta 🔴
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] DashboardScreen (home con picks)
- [ ] LeagueListScreen
- [ ] PickFormScreen

### Prioridad Media 🟡
- [ ] LeaderboardScreen
- [ ] ProfileScreen (editar foto y equipo favorito)
- [ ] CreateLeagueScreen
- [ ] JoinLeagueScreen

### Prioridad Baja 🟢
- [ ] StandingsScreen (NFL standings)
- [ ] GameDetailsScreen
- [ ] UserPicksScreen (ver picks de otros)
- [ ] InvitationScreen (deep link)

---

## 🧩 Componentes UI a Crear

- [ ] GameCard - Tarjeta de juego
- [ ] PickButton - Botón para elegir ganador
- [ ] TeamLogo - Logo del equipo
- [ ] LeaderboardRow - Fila de tabla
- [ ] Avatar - Avatar con foto o iniciales
- [ ] TeamSelector - Selector de equipo favorito
- [ ] LoadingSpinner - Spinner de carga
- [ ] ErrorAlert - Alerta de error
- [ ] InputField - Campo de texto
- [ ] ImagePicker - Selector de imagen

---

## 📦 Dependencias Necesarias

### Ya Instaladas ✅
- axios
- @react-native-async-storage/async-storage
- expo
- react-native

### Por Instalar
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Image picker
npm install expo-image-picker
npm install expo-camera

# Icons (opcional)
npm install react-native-vector-icons
```

---

## 🗺️ Navegación Sugerida

```typescript
<NavigationContainer>
  <Stack.Navigator>
    {!isAuthenticated ? (
      // Auth Stack
      <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </>
    ) : (
      // Main App
      <>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="CreateLeague" component={CreateLeagueScreen} />
        <Stack.Screen name="JoinLeague" component={JoinLeagueScreen} />
      </>
    )}
  </Stack.Navigator>
</NavigationContainer>

// Tabs
<Tab.Navigator>
  <Tab.Screen name="Dashboard" component={DashboardScreen} />
  <Tab.Screen name="Leagues" component={LeagueListScreen} />
  <Tab.Screen name="Standings" component={StandingsScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

---

## 🎨 Imágenes de Perfil

Las imágenes se manejan como base64:

```typescript
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from './src/services/api';

// Pedir permisos
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

// Seleccionar imagen
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5,
  base64: true,
});

if (!result.canceled) {
  const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
  await updateProfile({ profileImage: base64Image });
}
```

---

## 🐛 Debug y Testing

```bash
# Ver logs en tiempo real
npx expo start

# Clear cache
npx expo start -c

# Ver logs de Android
adb logcat | grep -i "ReactNativeJS"

# Ver logs de iOS
npx react-native log-ios
```

---

## 📝 Notas Importantes

1. **Backend en Render:** Siempre llamar `initializeBackend()` al inicio
2. **AsyncStorage Key:** El token se guarda con la key `'jwt'`
3. **Error Handling:** Todas las APIs pueden lanzar errores, usar try/catch
4. **TypeScript:** Aprovechar los tipos en `api.types.ts`
5. **Team Codes:** Ver `src/constants/teams.ts` para lista completa
6. **Profile Images:** Se envían como base64 strings

---

## 🎯 Roadmap

### ✅ Fase 1: Setup (COMPLETADO)
- [x] Estructura de carpetas
- [x] APIs completas (25 endpoints)
- [x] TypeScript types
- [x] Constantes de equipos NFL
- [x] Helpers y utilidades
- [x] Sistema de wake-up

### 🔄 Fase 2: Autenticación (SIGUIENTE)
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] Context de autenticación
- [ ] Persistencia de sesión
- [ ] Logout

### ⏳ Fase 3: Dashboard y Picks
- [ ] DashboardScreen
- [ ] GameCard component
- [ ] PickForm
- [ ] Navegación entre semanas

### ⏳ Fase 4: Ligas
- [ ] LeagueListScreen
- [ ] CreateLeagueScreen
- [ ] JoinLeagueScreen
- [ ] Sistema de invitaciones

### ⏳ Fase 5: Leaderboard y Stats
- [ ] LeaderboardScreen
- [ ] StandingsScreen
- [ ] Ver picks de otros usuarios

### ⏳ Fase 6: Perfil
- [ ] ProfileScreen
- [ ] ImagePicker
- [ ] Selector de equipo favorito

### ⏳ Fase 7: Deploy
- [ ] Testing
- [ ] Build para Android
- [ ] Build para iOS
- [ ] Publicar en stores

---

## 📞 Soporte

**Documentación:**
- `MOBILE_API_REFERENCE.md` - Guía completa de APIs
- `src/types/api.types.ts` - Tipos TypeScript
- `src/constants/teams.ts` - Equipos NFL
- `src/utils/helpers.ts` - Funciones auxiliares

**Backend:**
- URL: https://nfl-backend-invn.onrender.com
- Código: `/src` y `/frontend` (producción, no modificar)

---

**¡Las APIs están listas! Ahora a construir las pantallas! 🎉🏈**
