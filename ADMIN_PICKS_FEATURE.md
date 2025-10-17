# Funcionalidad: Picks por Administrador

## 📋 Descripción General

Esta funcionalidad permite a los **administradores de liga** hacer picks en nombre de usuarios que olvidaron realizar sus selecciones antes del cierre del plazo (inicio del partido de jueves).

## 🎯 Características Principales

### Restricciones y Validaciones

1. **Solo usuarios sin picks**: El administrador solo puede hacer picks para usuarios que NO hayan realizado selecciones para la semana actual.

2. **Solo partidos no iniciados**: No se pueden hacer picks para partidos que ya han comenzado. El sistema muestra únicamente los partidos disponibles.

3. **Límite de 3 usos por usuario**: Cada usuario puede recibir ayuda del administrador máximo **3 veces por temporada** en la misma liga.

4. **Sistema de penalizaciones**:
   - **1ra vez**: Gratis (sin penalización)
   - **2da vez**: -3 puntos del total de la semana
   - **3ra vez**: -3 puntos del total de la semana

### Cómo Funciona

#### Para el Administrador:

1. En la vista de estadísticas de liga en vivo, verá un botón **"Hacer Picks por Usuario"** (🏈)
2. Al hacer clic, se abre el **Admin Pick Manager** con:
   - Lista de todos los miembros de la liga
   - Estado de elegibilidad de cada usuario
   - Contador de usos previos (X/3)

3. Selecciona un usuario elegible y el sistema muestra:
   - Información del usuario
   - Cuántas veces se ha usado esta función para ese usuario
   - Advertencia sobre la penalización (si aplica)
   - Lista de partidos disponibles (no iniciados)

4. Selecciona los picks para el usuario
5. Confirma y guarda

#### Validaciones Automáticas:

El backend verifica:
- ✅ El solicitante es administrador de la liga
- ✅ El usuario objetivo es miembro de la liga
- ✅ El usuario no tiene picks para esa semana
- ✅ No se excede el límite de 3 usos
- ✅ Todos los partidos seleccionados no han comenzado

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: AdminPicks

```sql
CREATE TABLE "AdminPicks" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES "Users"(id),
  leagueId INTEGER NOT NULL REFERENCES "Leagues"(id),
  week INTEGER NOT NULL,
  adminId INTEGER NOT NULL REFERENCES "Users"(id),
  pickCount INTEGER NOT NULL,  -- 1, 2 o 3
  penaltyApplied INTEGER DEFAULT 0,  -- 0 o -3
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, leagueId, week)
);

CREATE INDEX admin_picks_user_league_idx ON "AdminPicks"(userId, leagueId);
```

## 🔌 API Endpoints

### 1. Verificar Elegibilidad

**GET** `/picks/admin/check-eligibility`

**Query Params:**
- `userId`: ID del usuario objetivo
- `leagueId`: ID de la liga
- `week`: Número de semana

**Response (Éxito):**
```json
{
  "eligible": true,
  "targetUser": {
    "id": 123,
    "username": "usuario123",
    "email": "user@example.com"
  },
  "usedCount": 1,
  "remainingUses": 2,
  "nextPickCount": 2,
  "penalty": -3,
  "penaltyMessage": "Segunda vez: -3 puntos",
  "availableGames": [
    {
      "id": 456,
      "homeTeam": "KC",
      "awayTeam": "SF",
      "date": "2025-10-20T20:00:00Z",
      "week": 7
    }
  ]
}
```

**Response (No elegible):**
```json
{
  "eligible": false,
  "message": "El usuario ya tiene picks para esta semana",
  "reason": "HAS_PICKS"
}
```

**Posibles razones:**
- `HAS_PICKS`: Usuario ya hizo picks
- `MAX_USES_REACHED`: Se alcanzó el límite de 3 usos
- `NO_AVAILABLE_GAMES`: Todos los partidos ya comenzaron

### 2. Hacer Picks por Usuario

**POST** `/picks/admin/make-for-user`

**Request Body:**
```json
{
  "userId": 123,
  "leagueId": 1,
  "week": 7,
  "picks": [
    {
      "gameId": 456,
      "pick": "KC",
      "week": 7
    },
    {
      "gameId": 457,
      "pick": "SF",
      "week": 7
    }
  ]
}
```

**Response:**
```json
{
  "message": "Picks guardados correctamente por el administrador.",
  "targetUser": {
    "id": 123,
    "username": "usuario123"
  },
  "pickCount": 2,
  "penalty": -3,
  "penaltyMessage": "Segunda vez: -3 puntos aplicados",
  "picksCreated": 2
}
```

## 🔄 Cálculo de Scores con Penalizaciones

El sistema de cálculo de scores (`statsController.calculateScores()`) aplica las penalizaciones automáticamente:

1. Calcula los puntos normales de todos los picks
2. Consulta la tabla `AdminPicks` para esa liga y semana
3. Si encuentra registros con `penaltyApplied !== 0`, resta esos puntos
4. Asegura que el score mínimo sea 0 (no puede ser negativo)

**Ejemplo:**
```javascript
// Usuario ganó 10 puntos normalmente
userScores[userId] = 10;

// Tiene penalización de -3 (2da o 3ra vez)
const penalty = -3;
userScores[userId] += penalty; // 10 + (-3) = 7

// Score final: 7 puntos
```

## 🎨 Componente Frontend: AdminPickManager

### Ubicación
`nfl/frontend/src/components/AdminPickManager.jsx`

### Props
```javascript
{
  token: string,           // JWT token
  league: object,          // Liga seleccionada
  week: number,            // Semana actual
  onClose: function,       // Callback al cerrar
  onSuccess: function      // Callback al guardar exitosamente
}
```

### Estados Visuales

1. **Selección de Usuario**: Lista de miembros de la liga
2. **Formulario de Picks**: 
   - Info del usuario y estadísticas de uso
   - Advertencia de penalización (si aplica)
   - Grid de partidos disponibles
   - Botones de selección de equipos
3. **Confirmación**: Mensaje de éxito

## 📱 Integración en Dashboard

El botón **"Hacer Picks por Usuario"** aparece:
- ✅ Solo para administradores de liga
- ✅ En la vista de estadísticas en vivo
- ✅ Cuando hay una semana seleccionada
- ❌ NO aparece en "Liga general"

## 🧪 Testing

### Casos de Prueba

1. **Verificación de Admin**
   - Usuario no admin intenta usar la función → Error 403
   
2. **Usuario con Picks**
   - Admin intenta hacer picks para usuario que ya los tiene → Error 400
   
3. **Límite de Usos**
   - Admin intenta usar 4ta vez → Error 400
   
4. **Partidos Iniciados**
   - Admin intenta hacer picks de partido ya comenzado → Error 403
   
5. **Penalizaciones**
   - 1ra vez: Verificar que no se aplique penalización
   - 2da vez: Verificar -3 puntos en score final
   - 3ra vez: Verificar -3 puntos en score final
   
6. **Cálculo de Scores**
   - Verificar que los puntos se calculen correctamente
   - Verificar que las penalizaciones se apliquen
   - Verificar que el score mínimo sea 0

## 🚀 Despliegue

### Pasos para Aplicar la Funcionalidad

1. **Backend**:
   ```bash
   cd nfl
   npm install
   ```

2. **Aplicar Migración** (si usas migraciones manuales):
   ```bash
   node migrations/add-admin-picks-table.js
   ```
   
   O el modelo se creará automáticamente con `sequelize.sync({ alter: true })`

3. **Frontend**:
   ```bash
   cd nfl/frontend
   npm install
   npm run build
   ```

4. **Reiniciar Backend**:
   El modelo `AdminPick` se registrará automáticamente al iniciar

## 📝 Notas Importantes

- ⚠️ La penalización se aplica al **total de la semana**, no a picks individuales
- ⚠️ El límite de 3 usos es **por usuario por liga**, no global
- ⚠️ Los picks hechos por admin cuentan como picks normales para el cálculo de scores
- ⚠️ La tabla `AdminPicks` mantiene un registro auditable de todos los picks hechos por administradores

## 🔐 Seguridad

- Todas las rutas requieren autenticación JWT
- Validación de roles en cada endpoint
- Validación de membresía en liga
- Prevención de modificación de picks existentes
- Validación de fechas de partidos en tiempo real

## 📊 Logs

El sistema genera logs detallados para debugging:
```
[calculateScores] Found X admin picks for league Y, week Z
[calculateScores] Applying penalty of -3 points to user X (pickCount: 2)
[calculateScores] Final scores after penalties: {...}
```

## 🎉 Beneficios

1. **Para Usuarios**: No pierden puntos por olvidos ocasionales
2. **Para Admins**: Herramienta flexible para ayudar a miembros
3. **Para la Liga**: Mayor engagement y satisfacción
4. **Sistema Justo**: Penalizaciones previenen abuso

---

**Versión**: 1.0.0  
**Fecha**: Octubre 2025  
**Autor**: MVPicks Development Team
