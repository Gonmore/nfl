# Nuevas Funcionalidades Implementadas

## Resumen de Cambios

Se han implementado 3 mejoras principales en la aplicación MVPicks:

---

## 1. 🎯 Menú Fuera de Días de Juego con Estadísticas Históricas

### Descripción
Ahora el menú de opciones se muestra **siempre** al entrar a una liga, independientemente de si estamos en días de juego o no.

### Funcionalidades:

#### Durante los días de juego (Jueves 20:00 - Lunes):
- **Ver mi Score - Semana X**: Muestra tus picks actuales y puntos ganados en tiempo real
- **Hacer Picks - Semana X+1**: Permite hacer picks para la próxima semana
- **Ver Liga en Vivo**: Muestra el ranking en tiempo real de todos los usuarios

#### Fuera de los días de juego:
- **Ver Estadísticas de Liga**: Muestra el podio con los puntos totales acumulados
- **Hacer Picks - Semana X**: Permite hacer picks para la semana actual
- Al entrar al detalle de cada jugador, se puede:
  - Ver los picks elegidos y puntos de la última semana
  - Navegar entre todas las semanas anteriores
  - Ver el historial completo de picks y puntos

### Archivos Modificados:
- `frontend/src/Dashboard.jsx`: Lógica del menú adaptativo

---

## 2. 🌐 Sistema de Wakeup Global con Animación NFL

### Descripción
El frontend ahora puede usar el endpoint `/auth/wakeup` desde **cualquier pantalla** y muestra una animación atractiva mientras el backend se reactiva.

### Funcionalidades:
- ✅ Detección automática del estado del backend al iniciar la app
- ✅ Timeout de 3 segundos antes de mostrar animación
- ✅ Animación con logos rotatorios de todos los equipos NFL
- ✅ Los logos se obtienen directamente de ESPN API (sin depender del backend)
- ✅ Mensaje: "CONECTANDO CON SERVIDORES NFL"
- ✅ Health check periódico cada 5 minutos
- ✅ Función `forceWakeup()` para operaciones críticas

### Componentes Creados:

#### 1. `NFLWakeupAnimation.jsx`
```javascript
// Componente visual con animación de logos NFL
<NFLWakeupAnimation isVisible={showWakeupAnimation} />
```
- Muestra logos de los 32 equipos NFL rotando
- URLs de logos desde: `https://a.espncdn.com/i/teamlogos/nfl/500/{abbr}.png`
- Animaciones suaves con CSS
- Anillo giratorio y efectos de transición

#### 2. `useGlobalBackendWakeup.js`
```javascript
// Hook personalizado para gestión global
const { isBackendAwake, showWakeupAnimation, forceWakeup } = useGlobalBackendWakeup();
```
- Intento automático de wakeup al cargar
- Health checks periódicos
- Reintentos automáticos si falla
- Método manual `forceWakeup()` para llamadas importantes

### Integración en App.jsx:
```javascript
import NFLWakeupAnimation from './components/NFLWakeupAnimation.jsx';
import { useGlobalBackendWakeup } from './hooks/useGlobalBackendWakeup.js';

const { showWakeupAnimation, isBackendAwake, forceWakeup } = useGlobalBackendWakeup();
```

### Archivos Creados/Modificados:
- ✅ `frontend/src/components/NFLWakeupAnimation.jsx` (NUEVO)
- ✅ `frontend/src/hooks/useGlobalBackendWakeup.js` (NUEVO)
- ✅ `frontend/src/App.jsx` (MODIFICADO)
- ✅ `frontend/src/api.js` (función wakeup ya existente)

---

## 3. 🧙 Sistema de Invitaciones con Picks Pre-Configurados

### Descripción
Los administradores de ligas privadas pueden ahora **generar invitaciones** para usuarios no registrados, incluyendo picks históricos hasta la semana actual. El usuario recibe un link único que le permite registrarse directamente con todos sus picks pre-configurados.

### Flujo Completo:

#### **Para el Administrador:**

##### Paso 1: Ingresar Email del Usuario a Invitar
- Ingresa el email del usuario que deseas invitar (no necesita estar registrado)
- Validación de formato de email
- Información clara: "Se generará un link de invitación para compartir"

##### Paso 2: Seleccionar Picks por Semana
- Navegación entre semanas (1 hasta la semana actual)
- Para cada semana, muestra todos los juegos disponibles
- Permite seleccionar el equipo ganador para cada juego
##### Paso 3: Confirmar y Generar Invitación
- Resumen completo:
  - Email del usuario
  - Liga
  - Total de picks pre-configurados
- Advertencia: Los picks se auto-agregarán cuando el usuario se registre
- Botón: "Generar Invitación"

##### Paso 4: Compartir Link de Invitación
- Se genera un link único con token de invitación válido por **7 días**
- Ejemplo: `https://tuapp.com?invitation=abc123xyz...`
- Opciones para compartir:
  - ✅ Copiar al portapapeles
  - ✅ Compartir directamente por WhatsApp (con mensaje pre-formateado)
- El link solo puede usarse **una vez**

#### **Para el Usuario Invitado:**

##### Paso 1: Recibir Invitación
- Recibe el link por WhatsApp u otro medio
- Al hacer clic, es redirigido a la página de registro

##### Paso 2: Registro con Invitación
- Se valida automáticamente el token de invitación
- Se muestra información de la invitación:
  - Nombre de la liga
  - Email pre-asignado (no modificable)
  - Cantidad de picks pre-configurados
- Debe ingresar:
  - Nombre de usuario (mínimo 3 caracteres)
  - Contraseña (mínimo 6 caracteres)
  - Confirmar contraseña

##### Paso 3: Acceso Automático
- Usuario se registra exitosamente
- Se agrega automáticamente a la liga
- Todos los picks históricos se crean automáticamente
- Inicia sesión directamente en el dashboard
- Mensaje de bienvenida con confirmación de liga y picks

### Restricciones y Validaciones:
- ✅ Solo el creador/admin de la liga puede crear invitaciones
- ✅ El email no puede estar ya registrado en la plataforma
- ✅ Solo se pueden pre-configurar picks hasta la semana actual
- ✅ El token de invitación expira en **7 días**
- ✅ Cada token solo puede usarse **una vez**
- ✅ El email en el registro debe coincidir con el email de la invitación
- ✅ Al registrarse, también se agrega automáticamente a la "Liga General"

### Componentes Creados:

#### Frontend:
```javascript
// Wizard completo en 4 pasos (Admin)
<AddUserWizard
  league={selectedLeague}
  onClose={() => setShowAddUserWizard(false)}
  token={token}
  currentWeek={currentWeek}
  showToast={showToast}
/>

// Página de registro con invitación (Usuario)
<RegisterWithInvitation
  invitationToken={invitationToken}
  onRegisterSuccess={handleInvitationRegisterSuccess}
  onCancel={handleInvitationCancel}
/>
```

#### Backend - Endpoints Nuevos:

1. **POST `/leagues/create-invitation-with-picks`** 🆕
   - Headers: `Authorization: Bearer {token}`
   - Body: `{ email, leagueId, picks: { week: [{ gameId, pick }] } }`
   - Validaciones:
     - Liga existe y usuario es admin
     - Email no está registrado o no está en la liga
     - Formato de email válido
   - Genera token único (crypto.randomBytes)
   - Crea entrada en tabla `invitation_tokens`
   - Retorna: `{ token, email, expiresAt }`

2. **GET `/auth/validate-invitation/:token`** 🆕
   - Valida un token de invitación
   - Verificaciones:
     - Token existe
     - No ha sido usado
     - No ha expirado
   - Retorna: `{ valid: true, email, leagueName, picksCount }`

3. **POST `/auth/register-with-invitation`** 🆕
   - Body: `{ invitationToken, username, password }`
   - Flujo completo:
     - Valida token (existe, no usado, no expirado)
     - Crea usuario con email de la invitación
     - Agrega a Liga General
     - Agrega a liga de la invitación
     - Crea todos los picks históricos
     - Marca token como usado
     - Genera JWT
   - Retorna: `{ token, user: { id, username, email, profileImage } }`

4. **GET `/auth/check-user?email={email}`** (ya existía)
   - Verifica si un usuario existe por email
   - Retorna: `{ exists: boolean, user?: { id, username, email } }`

5. **GET `/nfl/games/all-until-week?week={week}`** (ya existía)
   - Retorna todos los juegos desde semana 1 hasta la semana especificada
   - Ordenados por semana y fecha

### Archivos Creados/Modificados:

#### Frontend:
- ✅ `frontend/src/components/AddUserWizard.jsx` (MODIFICADO - 4 pasos con link)
- ✅ `frontend/src/RegisterWithInvitation.jsx` (NUEVO)
- ✅ `frontend/src/App.jsx` (MODIFICADO - detección de invitación en URL)
- ✅ `frontend/src/Dashboard.jsx` (MODIFICADO - import y estado)
- ✅ `frontend/src/api.js` (MODIFICADO - nuevas funciones)

#### Backend:
- ✅ `src/models/InvitationToken.js` (NUEVO)
- ✅ `src/models/index.js` (MODIFICADO - importar InvitationToken)
- ✅ `src/controllers/authController.js` (MODIFICADO - validateInvitationToken, registerWithInvitation)
- ✅ `src/controllers/leagueController.js` (MODIFICADO - createInvitationWithPicks)
- ✅ `src/controllers/gameController.js` (MODIFICADO - getAllGamesUntilWeek)
- ✅ `src/routes/auth.js` (MODIFICADO - nuevas rutas)
- ✅ `src/routes/league.js` (MODIFICADO - nueva ruta)
- ✅ `src/routes/game.js` (MODIFICADO - nueva ruta)
- ✅ `migrations/add-invitation-tokens-table.js` (NUEVO)

#### Base de Datos - Nueva Tabla:
```sql
invitation_tokens
├── id (INTEGER, PK, AUTO_INCREMENT)
├── token (STRING, UNIQUE, NOT NULL)
├── email (STRING, NOT NULL)
├── leagueId (INTEGER, FK → leagues.id)
├── picksData (JSONB, NOT NULL)
├── expiresAt (DATE, NOT NULL)
├── used (BOOLEAN, DEFAULT false)
├── createdAt (DATE)
└── updatedAt (DATE)
```

---

## Cómo Usar las Nuevas Funcionalidades

### 1. Acceder al Menú de Liga:
1. Inicia sesión en la aplicación
2. Selecciona cualquier liga
3. El menú se mostrará automáticamente con las opciones según el estado

### 2. Ver Estadísticas Históricas (Fuera de días de juego):
1. Selecciona "Ver Estadísticas de Liga"
2. Verás el podio con puntos totales
3. Haz clic en cualquier jugador
4. Usa el selector de semana para navegar por el historial

### 3. Invitar Usuario con Picks Pre-Configurados (Solo Admins):
1. Asegúrate de ser el creador de una liga privada
2. En la vista de "Liga en Vivo", busca el botón "Agregar Usuario"
3. Sigue el wizard:
   - **Paso 1**: Ingresa el email del usuario a invitar
   - **Paso 2**: Selecciona los picks para cada semana (navega con las flechas)
   - **Paso 3**: Revisa el resumen y genera la invitación
   - **Paso 4**: Copia el link o compártelo directamente por WhatsApp
4. Envía el link al usuario invitado

### 4. Registrarse con Invitación (Usuario Invitado):
1. Haz clic en el link de invitación que recibiste
2. Verás la información de la liga y picks pre-configurados
3. Elige tu nombre de usuario y contraseña
4. Completa el registro
5. Serás redirigido automáticamente al dashboard con todos tus picks listos

---

## Consideraciones Técnicas

### Performance:
- El hook de wakeup se ejecuta solo una vez por sesión
- Los health checks son cada 5 minutos para no sobrecargar

### Seguridad:
- Tokens de invitación generados con `crypto.randomBytes(32)` (altamente seguros)
- Validación de expiración (7 días)
- Verificación de uso único
- Tokens indexados en base de datos para búsqueda rápida
- Autenticación JWT tras registro exitoso

### UX/UI:
- Link de invitación con parámetro `?invitation=TOKEN` en URL
- Mensaje de WhatsApp pre-formateado para fácil compartición
- Botón de copiar al portapapeles con feedback visual
- Validación en tiempo real del token antes de mostrar formulario
- Mensajes claros de error si el token es inválido/expirado/usado
- La animación NFL carga logos bajo demanda

### Seguridad:
- Todos los endpoints están protegidos con `authMiddleware`
- Solo admins de liga pueden agregar usuarios
- Validaciones exhaustivas en backend

### Escalabilidad:
- El wizard carga juegos solo cuando es necesario
- Los picks se crean en batch para eficiencia
- Las consultas usan índices en la BD

---

## Testing Sugerido

### 1. Menú Adaptativo:
- ✅ Probar en jueves antes y después de las 20:00
- ✅ Probar en viernes, sábado, domingo, lunes
- ✅ Probar en martes y miércoles
- ✅ Verificar navegación de semanas en estadísticas

### 2. Sistema de Wakeup:
- ✅ Probar con backend dormido (después de 15min inactividad en Render)
- ✅ Verificar que la animación aparece después de 3 segundos
- ✅ Verificar que desaparece al conectar
- ✅ Probar en diferentes pantallas de la app

### 3. Wizard de Usuario:
- ✅ Probar con email inexistente
- ✅ Probar con email existente
- ✅ Intentar agregar usuario ya en la liga
- ✅ Probar navegación entre semanas
- ✅ Verificar que no permite avanzar sin completar picks
- ✅ Verificar resumen final antes de confirmar

---

## Próximas Mejoras Sugeridas

1. **Notificaciones Push** cuando un partido termina
2. **Estadísticas avanzadas**: gráficos de rendimiento por semana
3. **Exportar resumen** de liga en PDF
4. **Chat en tiempo real** durante partidos
5. **Predicciones con IA** basadas en historial

---

## Soporte

Para dudas o problemas con las nuevas funcionalidades, contactar al equipo de desarrollo.

**Fecha de implementación:** Octubre 2025
**Versión:** 2.0.0
