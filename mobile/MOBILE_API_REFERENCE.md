# 📱 MVPicks Mobile - API Reference

## ✅ Estado Actual

La aplicación móvil ya tiene **TODAS las APIs del backend integradas** y listas para usar. Este documento describe cada endpoint disponible.

---

## 🔐 AUTH APIs

### 1. Login
```typescript
import { loginUser } from './src/services/api';

const response = await loginUser(email, password);
// Returns: { token, user: { id, username, email, profileImage, favoriteTeam } }
```

### 2. Register
```typescript
import { registerUser } from './src/services/api';

const response = await registerUser(username, email, password);
// Returns: { message, token, user }
```

### 3. Update Profile
```typescript
import { updateProfile } from './src/services/api';

const response = await updateProfile({
  username: 'nuevo_nombre',           // Opcional
  password: 'nueva_password',         // Opcional
  profileImage: 'data:image/jpeg;base64,...',  // Opcional - base64 string
  favoriteTeam: 'KC'                  // Opcional - código de equipo
});
// Returns: { message, user }
```

### 4. Check if User Exists
```typescript
import { checkUserExists } from './src/services/api';

const response = await checkUserExists('email@example.com');
// Returns: { exists: boolean }
```

### 5. Wake Up Backend (Render)
```typescript
import { wakeup } from './src/services/api';

await wakeup();
// Returns: { message: 'Server is awake!' }
```

---

## 💌 INVITATION APIs

### 1. Validate Invitation Token
```typescript
import { validateInvitationToken } from './src/services/api';

const response = await validateInvitationToken(invitationToken);
// Returns: { valid: boolean, email, leagueId, picks }
```

### 2. Register with Invitation
```typescript
import { registerWithInvitation } from './src/services/api';

const response = await registerWithInvitation(invitationToken, username, password);
// Returns: { token, user, message }
```

### 3. Create Invitation with Picks
```typescript
import { createInvitationWithPicks } from './src/services/api';

const response = await createInvitationWithPicks(
  'email@example.com',
  leagueId,
  { gameId1: teamId1, gameId2: teamId2, ... }
);
// Returns: { message, invitationUrl }
```

### 4. Add User with Picks (Existing User)
```typescript
import { addUserWithPicks } from './src/services/api';

const response = await addUserWithPicks(
  'email@example.com',
  leagueId,
  { gameId1: teamId1, gameId2: teamId2, ... }
);
// Returns: { message }
```

---

## 🏆 LEAGUE APIs

### 1. Get User Leagues
```typescript
import { getUserLeagues } from './src/services/api';

const response = await getUserLeagues();
// Returns: { leagues: [{ id, name, description, isPublic, inviteCode, role }] }
```

### 2. Create League
```typescript
import { createLeague } from './src/services/api';

const response = await createLeague(
  'Mi Liga NFL',
  'Descripción de la liga',
  true  // isPublic
);
// Returns: { message, league: { id, name, inviteCode, ... } }
```

### 3. Join League by Code
```typescript
import { joinLeague } from './src/services/api';

const response = await joinLeague('INVITE123');
// Returns: { message, league }
```

### 4. Join General League
```typescript
import { joinGeneralLeague } from './src/services/api';

const response = await joinGeneralLeague();
// Returns: { message, league }
```

---

## 🏈 GAME APIs

### 1. Get Current Week Games
```typescript
import { getGames } from './src/services/api';

const response = await getGames();
// Returns: { games: [...], currentWeek }
```

### 2. Get Games by Week
```typescript
import { getGamesByWeek } from './src/services/api';

const response = await getGamesByWeek(5);
// Returns: { games: [...], week }
```

### 3. Get All Games Until Week (Historical)
```typescript
import { getAllGamesUntilWeek } from './src/services/api';

const response = await getAllGamesUntilWeek(10);
// Returns: { games: [...], weeksIncluded: [1,2,3,...,10] }
```

**Formato de Game:**
```typescript
{
  id: number,
  week: number,
  homeTeam: string,      // 'KC', 'SF', etc.
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  gameDate: string,      // ISO date
  status: string,        // 'scheduled', 'in_progress', 'final'
  winner: string | null  // teamId del ganador
}
```

---

## 🎯 PICK APIs

### 1. Get User Picks
```typescript
import { getUserPicks } from './src/services/api';

const response = await getUserPicks(leagueId, week);
// Returns: { picks: [{ gameId, selectedTeam, isCorrect, points }] }
```

### 2. Get User Picks Details (con userId para ver picks de otros)
```typescript
import { getUserPicksDetails } from './src/services/api';

// Ver mis picks
const myPicks = await getUserPicksDetails(leagueId, week);

// Ver picks de otro usuario
const userPicks = await getUserPicksDetails(leagueId, week, userId);
// Returns: { picks: [...], user: { username, profileImage, favoriteTeam } }
```

### 3. Make Picks
```typescript
import { makePicks } from './src/services/api';

const response = await makePicks(leagueId, {
  123: 456,  // gameId: teamId
  124: 457,
  125: 458
});
// Returns: { message, picks: [...] }
```

---

## 📊 STATS APIs

### 1. Get League Stats
```typescript
import { getLeagueStats } from './src/services/api';

const response = await getLeagueStats(leagueId, week);
// Returns: {
//   leaderboard: [{
//     userId,
//     username,
//     profileImage,
//     favoriteTeam,
//     correctPicks,
//     totalPicks,
//     points,
//     rank
//   }]
// }
```

### 2. Get NFL Standings
```typescript
import { getStandings } from './src/services/api';

const response = await getStandings();
// Returns: {
//   standings: [{
//     team: string,
//     wins: number,
//     losses: number,
//     ties: number,
//     division: string
//   }]
// }
```

### 3. Recalculate Scores (Admin)
```typescript
import { recalculateScores } from './src/services/api';

// Recalcular una liga específica
await recalculateScores({ leagueId: 1, week: 5 });

// Recalcular todas las ligas
await recalculateScores({ allLeagues: true, week: 5 });

// Returns: { message, updatedCount }
```

---

## 🔒 Autenticación Automática

El interceptor de axios **automáticamente** agrega el JWT token a todas las peticiones:

```typescript
// Interceptor configurado en api.ts
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Guardar token después del login:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from './src/services/api';

const response = await loginUser(email, password);
await AsyncStorage.setItem('jwt', response.token);
```

---

## 📝 Códigos de Equipos NFL

Para `favoriteTeam` y picks:
- **AFC East:** `BUF`, `MIA`, `NE`, `NYJ`
- **AFC North:** `BAL`, `CIN`, `CLE`, `PIT`
- **AFC South:** `HOU`, `IND`, `JAX`, `TEN`
- **AFC West:** `DEN`, `KC`, `LV`, `LAC`
- **NFC East:** `DAL`, `NYG`, `PHI`, `WAS`
- **NFC North:** `CHI`, `DET`, `GB`, `MIN`
- **NFC South:** `ATL`, `CAR`, `NO`, `TB`
- **NFC West:** `ARI`, `LAR`, `SF`, `SEA`

---

## 🎨 Profile Images

Las imágenes de perfil se envían como **base64 strings**:

```typescript
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from './src/services/api';

// Ejemplo: Seleccionar imagen y subirla
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

## 🚀 Próximos Pasos

### 1. **Screens a Implementar**
- [x] Estructura base de la app
- [x] API service completo
- [ ] Login Screen
- [ ] Register Screen
- [ ] Dashboard/Home Screen
- [ ] League List Screen
- [ ] Pick Form Screen
- [ ] Leaderboard Screen
- [ ] Profile Screen
- [ ] Standings Screen

### 2. **Componentes UI**
- [ ] GameCard component
- [ ] PickButton component
- [ ] LeaderboardRow component
- [ ] TeamLogo component
- [ ] LoadingSpinner component
- [ ] ErrorAlert component

### 3. **Navigation**
- [ ] Stack Navigator (Auth)
- [ ] Tab Navigator (Main App)
- [ ] Deep linking para invitations

### 4. **State Management**
- [ ] Context API para user/auth
- [ ] Context API para leagues
- [ ] AsyncStorage persistence

---

## 🐛 Notas Importantes

1. **Backend en Render (Free Tier):** El backend duerme después de 15 minutos de inactividad. Usar `wakeup()` al abrir la app.

2. **AsyncStorage Key:** El token se guarda con la key `'jwt'` (no `'token'`)

3. **Error Handling:** Todas las APIs pueden lanzar errores. Usar try/catch:
```typescript
try {
  const response = await getGames();
  console.log(response.games);
} catch (error) {
  console.error('Error fetching games:', error);
}
```

4. **TypeScript:** Todas las funciones están tipadas. Ver tipos en `api.ts`

---

## 📦 Dependencias Necesarias

Ya instaladas:
- ✅ `axios`
- ✅ `@react-native-async-storage/async-storage`

Por instalar (para UI):
- [ ] `@react-navigation/native`
- [ ] `@react-navigation/stack`
- [ ] `@react-navigation/bottom-tabs`
- [ ] `expo-image-picker`
- [ ] `expo-camera`
- [ ] `react-native-safe-area-context`
- [ ] `react-native-screens`

---

**¡Las APIs están listas! Ahora a construir las pantallas! 🎉**
