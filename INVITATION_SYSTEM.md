# Sistema de Invitaciones con Picks Pre-Configurados

## 📋 Descripción General

Este sistema permite a los administradores de ligas privadas invitar a usuarios **no registrados** a unirse a su liga, pre-configurando todos los picks históricos hasta la semana actual. El usuario invitado recibe un link único que le permite registrarse directamente con todos sus picks ya listos.

---

## 🔄 Flujo Completo

### Para el Administrador de Liga:

1. **Iniciar Invitación**
   - Acceder al wizard desde el dashboard de la liga
   - Solo disponible para creadores de ligas privadas

2. **Paso 1: Ingresar Email**
   - Ingresar el email del usuario a invitar
   - No necesita estar registrado en la plataforma
   - Validación de formato de email

3. **Paso 2: Configurar Picks por Semana**
   - Navegar entre semanas (1 hasta semana actual)
   - Seleccionar equipo ganador para cada juego
   - Indicador visual de progreso (✓)

4. **Paso 3: Confirmar y Generar**
   - Revisar resumen (email, liga, total de picks)
   - Generar invitación

5. **Paso 4: Compartir Link**
   - Copiar link al portapapeles
   - Compartir directamente por WhatsApp
   - Link válido por 7 días

### Para el Usuario Invitado:

1. **Recibir Invitación**
   - Recibir link por WhatsApp u otro medio
   - Formato: `https://tuapp.com?invitation=TOKEN`

2. **Abrir Link**
   - Al hacer clic, se abre la página de registro
   - Se valida automáticamente el token

3. **Ver Información de Invitación**
   - Nombre de la liga
   - Email pre-asignado (no modificable)
   - Cantidad de picks pre-configurados

4. **Completar Registro**
   - Elegir nombre de usuario (mín. 3 caracteres)
   - Crear contraseña (mín. 6 caracteres)
   - Confirmar contraseña

5. **Acceso Automático**
   - Registro exitoso
   - Auto-agregado a la liga
   - Todos los picks históricos creados
   - Login automático al dashboard

---

## 🔒 Seguridad

### Generación de Tokens:
```javascript
const token = crypto.randomBytes(32).toString('hex');
```
- Tokens de 64 caracteres hexadecimales
- Altamente seguros contra ataques de fuerza bruta
- Únicos e irrepetibles

### Validaciones:
- ✅ Token existe en base de datos
- ✅ Token no ha sido usado
- ✅ Token no ha expirado (7 días)
- ✅ Email coincide con el de la invitación
- ✅ Usuario no está ya registrado

### Base de Datos:
```sql
CREATE TABLE invitation_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  leagueId INTEGER REFERENCES leagues(id),
  picksData JSONB NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_email ON invitation_tokens(email);
CREATE INDEX idx_invitation_league ON invitation_tokens(leagueId);
```

---

## 📡 Endpoints API

### 1. Crear Invitación
```http
POST /leagues/create-invitation-with-picks
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "email": "usuario@example.com",
  "leagueId": 123,
  "picks": {
    "1": [
      { "gameId": 1, "pick": "KC" },
      { "gameId": 2, "pick": "SF" }
    ],
    "2": [
      { "gameId": 15, "pick": "BUF" }
    ]
  }
}
```

**Respuesta Exitosa:**
```json
{
  "message": "Invitación creada exitosamente.",
  "token": "abc123...xyz789",
  "email": "usuario@example.com",
  "expiresAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Validar Token de Invitación
```http
GET /auth/validate-invitation/:token
```

**Respuesta Exitosa:**
```json
{
  "valid": true,
  "email": "usuario@example.com",
  "leagueName": "Mi Liga Privada",
  "picksCount": 45
}
```

**Respuesta Error:**
```json
{
  "message": "Esta invitación ha expirado."
}
```

### 3. Registrarse con Invitación
```http
POST /auth/register-with-invitation
Content-Type: application/json

{
  "invitationToken": "abc123...xyz789",
  "username": "NuevoUsuario",
  "password": "password123"
}
```

**Respuesta Exitosa:**
```json
{
  "message": "Usuario registrado correctamente con invitación.",
  "token": "JWT_TOKEN",
  "user": {
    "id": 456,
    "username": "NuevoUsuario",
    "email": "usuario@example.com",
    "profileImage": null
  }
}
```

---

## 🎨 Componentes Frontend

### AddUserWizard.jsx
**Ubicación:** `frontend/src/components/AddUserWizard.jsx`

**Props:**
- `league`: Objeto con datos de la liga
- `onClose`: Función callback para cerrar el wizard
- `token`: JWT token del admin
- `currentWeek`: Semana actual de la NFL
- `showToast`: Función para mostrar notificaciones

**Estados Principales:**
```javascript
const [step, setStep] = useState(1);           // Paso actual (1-4)
const [userEmail, setUserEmail] = useState(''); // Email del usuario
const [picks, setPicks] = useState({});         // { week: [{ gameId, pick }] }
const [invitationToken, setInvitationToken] = useState('');
const [invitationLink, setInvitationLink] = useState('');
```

### RegisterWithInvitation.jsx
**Ubicación:** `frontend/src/RegisterWithInvitation.jsx`

**Props:**
- `invitationToken`: Token de invitación desde URL
- `onRegisterSuccess`: Callback al registrarse exitosamente
- `onCancel`: Callback para cancelar y volver

**Estados Principales:**
```javascript
const [validating, setValidating] = useState(true);
const [invitationData, setInvitationData] = useState(null);
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
```

---

## 📱 Integración con WhatsApp

El link se comparte con un mensaje pre-formateado:

```javascript
const whatsappMessage = encodeURIComponent(
  `🏈 ¡Invitación a Liga NFL!\n\n` +
  `Has sido invitado a unirte a la liga "${league.name}".\n\n` +
  `Tus picks ya están pre-configurados. Solo regístrate haciendo clic aquí:\n\n` +
  invitationLink
);

const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
```

**Resultado:**
```
🏈 ¡Invitación a Liga NFL!

Has sido invitado a unirte a la liga "Mi Liga Privada".

Tus picks ya están pre-configurados. Solo regístrate haciendo clic aquí:

https://tuapp.com?invitation=abc123xyz...
```

---

## 🧪 Testing

### Casos de Prueba:

#### Admin - Crear Invitación:
1. ✅ Token válido generado
2. ✅ Email no puede estar ya en la liga
3. ✅ Solo admin puede crear invitaciones
4. ✅ Picks se guardan correctamente en formato JSONB

#### Usuario - Validar Token:
1. ✅ Token válido retorna información correcta
2. ✅ Token expirado retorna error
3. ✅ Token usado retorna error
4. ✅ Token inexistente retorna error

#### Usuario - Registro:
1. ✅ Usuario se crea correctamente
2. ✅ Se agrega a Liga General
3. ✅ Se agrega a liga de invitación
4. ✅ Todos los picks se crean correctamente
5. ✅ Token se marca como usado
6. ✅ JWT generado correctamente
7. ✅ Email duplicado retorna error
8. ✅ Contraseñas no coinciden retorna error

---

## 🚀 Migración de Base de Datos

Para aplicar la nueva tabla:

```bash
node migrations/add-invitation-tokens-table.js
```

O ejecutar manualmente:

```sql
CREATE TABLE invitation_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  "leagueId" INTEGER NOT NULL REFERENCES leagues(id),
  "picksData" JSONB NOT NULL DEFAULT '{}',
  "expiresAt" TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON invitation_tokens(token);
CREATE INDEX idx_invitation_email ON invitation_tokens(email);
CREATE INDEX idx_invitation_league ON invitation_tokens("leagueId");
```

---

## 🔍 Troubleshooting

### Problema: Token no válido
**Solución:** Verificar que:
- El token existe en la tabla `invitation_tokens`
- `used = false`
- `expiresAt > NOW()`

### Problema: Usuario no puede registrarse
**Solución:** Verificar que:
- El email no está ya registrado
- El formato de email es válido
- La contraseña tiene mínimo 6 caracteres
- El nombre de usuario tiene mínimo 3 caracteres

### Problema: Picks no se crean
**Solución:** Verificar que:
- Los `gameId` en `picksData` existen en la tabla `games`
- El formato JSON es correcto: `{ "1": [{ "gameId": 1, "pick": "KC" }] }`
- La liga existe y el usuario es miembro

---

## 📝 Notas Importantes

1. **Expiración:** Los tokens expiran en 7 días automáticamente
2. **Uso Único:** Cada token solo puede usarse una vez
3. **Email Fijo:** El email no se puede cambiar durante el registro
4. **Auto-Login:** Tras registrarse, el usuario inicia sesión automáticamente
5. **Liga General:** Todos los usuarios también se agregan a la "Liga General"
6. **Picks Inmutables:** Los picks históricos no se pueden modificar después

---

## 🎯 Próximas Mejoras

- [ ] Notificaciones por email al enviar invitación
- [ ] Dashboard de invitaciones pendientes para admin
- [ ] Estadísticas de invitaciones (enviadas, aceptadas, expiradas)
- [ ] Opción para re-enviar invitación expirada
- [ ] Límite de invitaciones por liga
- [ ] Historial de invitaciones en perfil de admin
