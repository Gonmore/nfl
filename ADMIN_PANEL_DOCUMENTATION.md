# Panel de Administración Web de Base de Datos

## 🎯 Descripción

Sistema de administración web para gestionar la base de datos de MVPicks a través de una interfaz intuitiva. Permite ver, crear, editar y eliminar registros de todas las tablas del sistema usando Sequelize ORM.

## 🔐 Seguridad

- **Autenticación requerida**: JWT Token
- **Solo administradores globales**: Usuario con `id=1` o `username='admin'`
- **Consultas SQL limitadas**: Solo permite SELECT para prevenir modificaciones peligrosas
- **Validaciones**: Todas las operaciones CRUD validan permisos

## 📡 API Endpoints

### Base URL: `/admin`

Todos los endpoints requieren:
- Header: `Authorization: Bearer {token}`
- Permisos de administrador global

### 1. Estadísticas Generales
```
GET /admin/stats
```

**Response:**
```json
{
  "totalRecords": {
    "users": 150,
    "leagues": 25,
    "games": 300,
    "picks": 5000,
    "scores": 3500
  },
  "additionalStats": {
    "activeLeagues": 20,
    "publicLeagues": 5,
    "finishedGames": 250,
    "pendingGames": 50
  }
}
```

### 2. Listar Tablas Disponibles
```
GET /admin/tables
```

**Response:**
```json
{
  "tables": {
    "users": { "name": "Usuarios", "model": "User" },
    "leagues": { "name": "Ligas", "model": "League" },
    "games": { "name": "Partidos", "model": "Game" }
  }
}
```

### 3. Obtener Esquema de Tabla
```
GET /admin/tables/:table/schema
```

**Response:**
```json
{
  "table": "users",
  "schema": [
    {
      "field": "id",
      "type": "INTEGER",
      "allowNull": false,
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "field": "username",
      "type": "VARCHAR(255)",
      "allowNull": false
    }
  ]
}
```

### 4. Obtener Datos de Tabla (con paginación)
```
GET /admin/tables/:table?page=1&limit=50&orderBy=id&order=ASC
```

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 50)
- `orderBy`: Campo para ordenar (default: 'id')
- `order`: ASC o DESC (default: 'ASC')

**Response:**
```json
{
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@mvpicks.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. Obtener Registro Específico
```
GET /admin/tables/:table/:id
```

**Response:**
```json
{
  "record": {
    "id": 1,
    "username": "admin",
    "email": "admin@mvpicks.com"
  }
}
```

### 6. Crear Registro
```
POST /admin/tables/:table
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "hashedpassword"
}
```

**Response:**
```json
{
  "message": "Registro creado exitosamente.",
  "record": { ... }
}
```

### 7. Actualizar Registro
```
PUT /admin/tables/:table/:id
```

**Request Body:**
```json
{
  "username": "updateduser",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "message": "Registro actualizado exitosamente.",
  "record": { ... }
}
```

### 8. Eliminar Registro
```
DELETE /admin/tables/:table/:id
```

**Response:**
```json
{
  "message": "Registro eliminado exitosamente."
}
```

### 9. Ejecutar Consulta SQL Personalizada
```
POST /admin/query
```

**Request Body:**
```json
{
  "query": "SELECT * FROM \"Users\" WHERE username LIKE '%admin%'"
}
```

**Restricciones:**
- ⚠️ Solo permite consultas SELECT
- ⚠️ No permite INSERT, UPDATE, DELETE, DROP, etc.

**Response:**
```json
{
  "results": [ ... ],
  "count": 5
}
```

## 🖥️ Interfaz Web

### Acceso

Abre tu navegador en:
```
http://localhost:5001/admin.html
```

### Credenciales

Usa las credenciales del usuario administrador:
- **Email**: admin@mvpicks.com
- **Password**: (la que configuraste para el usuario admin)

### Funcionalidades de la Interfaz

#### 1. Dashboard Principal
- Estadísticas en tiempo real de todas las tablas
- Contadores visuales de registros
- Acceso rápido a cada tabla

#### 2. Vista de Tablas
- Lista de todas las tablas disponibles
- Tarjetas clicables para acceder a cada tabla

#### 3. Gestión de Datos
- **Ver**: Tabla paginada con todos los registros
- **Crear**: Formulario dinámico basado en el esquema
- **Editar**: Formulario pre-llenado con datos actuales
- **Eliminar**: Confirmación antes de eliminar

#### 4. Consultas SQL Personalizadas
- Editor de texto para escribir consultas SELECT
- Resultados mostrados en tabla
- Contador de resultados

#### 5. Navegación
- Paginación para tablas grandes
- Botón de volver para regresar al dashboard
- Logout para cerrar sesión

## 📊 Tablas Administrables

1. **Users** (Usuarios)
   - Gestión de usuarios del sistema
   - Contraseñas, emails, perfiles

2. **Leagues** (Ligas)
   - Ligas públicas y privadas
   - Administradores, códigos de invitación

3. **LeagueMembers** (Miembros de Liga)
   - Relaciones usuario-liga
   - Membresías activas

4. **Games** (Partidos)
   - Partidos NFL de ESPN
   - Estados, ganadores, fechas

5. **Picks** (Picks)
   - Selecciones de usuarios
   - Por liga y semana

6. **Scores** (Puntuaciones)
   - Puntos por usuario/liga/semana
   - Historial de puntuaciones

7. **InvitationTokens** (Tokens de Invitación)
   - Invitaciones pendientes
   - Picks pre-configurados

8. **AdminPicks** (Picks de Admin)
   - Picks hechos por administradores
   - Penalizaciones aplicadas

## 🎨 Características de la Interfaz

### Diseño
- **Tema oscuro** moderno y profesional
- **Responsive** para móvil y desktop
- **Glassmorphism** con blur effects
- **Colores corporativos** (#00d9ff)

### UX
- **Formularios dinámicos** basados en esquema de BD
- **Validación** de campos requeridos
- **Mensajes** de éxito y error
- **Confirmaciones** antes de eliminar
- **Paginación** automática

### Rendimiento
- **Carga progresiva** de datos
- **Límite de 50 registros** por página
- **LocalStorage** para mantener sesión

## 🔒 Consideraciones de Seguridad

### Implementadas
✅ Autenticación JWT obligatoria
✅ Verificación de rol de admin
✅ Solo consultas SELECT en SQL personalizado
✅ Validación de permisos en cada endpoint
✅ Escape de caracteres en consultas

### Recomendaciones Adicionales
⚠️ Usar HTTPS en producción
⚠️ Implementar rate limiting
⚠️ Agregar logs de auditoría
⚠️ Implementar 2FA para admins
⚠️ Restringir por IP en producción

## 🚀 Uso

### 1. Iniciar el Backend
```bash
cd nfl
npm run dev
```

### 2. Acceder al Panel
```
http://localhost:5001/admin.html
```

### 3. Login
- Email: admin@mvpicks.com
- Password: tu_contraseña_admin

### 4. Explorar
- Ver estadísticas generales
- Navegar por las tablas
- Crear/editar/eliminar registros
- Ejecutar consultas SQL

## 📝 Ejemplos de Uso

### Ejemplo 1: Ver todos los usuarios
1. Click en tarjeta "Usuarios"
2. Ver lista paginada
3. Usar botones "Siguiente/Anterior"

### Ejemplo 2: Crear nueva liga
1. Click en tarjeta "Ligas"
2. Click en "Crear Registro"
3. Llenar formulario
4. Click en "Guardar"

### Ejemplo 3: Consulta SQL personalizada
1. En el panel de consultas escribir:
   ```sql
   SELECT u.username, COUNT(p.id) as picks_count 
   FROM "Users" u 
   LEFT JOIN "Picks" p ON u.id = p."userId" 
   GROUP BY u.username
   ```
2. Click en "Ejecutar Consulta"
3. Ver resultados en tabla

## 🛠️ Personalización

### Cambiar Usuario Admin
Modifica en `src/controllers/adminController.js`:
```javascript
const isGlobalAdmin = async (req, res, next) => {
  // Personaliza la lógica de verificación aquí
  if (user && (user.id === 1 || user.username === 'admin')) {
    next();
  }
}
```

### Agregar Nueva Tabla
1. Crea el modelo en `src/models/`
2. Agrégalo a `src/models/index.js`
3. Agrégalo en `adminController.js`:
   ```javascript
   const models = {
     users: User,
     leagues: League,
     // ... tu nueva tabla
   };
   ```

### Personalizar Tema
Modifica los estilos CSS en `public/admin.html`:
```css
:root {
  --primary-color: #00d9ff;
  --background: #1a1a2e;
  --secondary: #16213e;
}
```

## 🐛 Solución de Problemas

### Error 403: Acceso Denegado
- Verifica que el usuario tenga ID=1 o username='admin'
- Revisa los logs del servidor
- Confirma el token JWT en localStorage

### No carga los datos
- Verifica que el backend esté corriendo
- Revisa la consola del navegador (F12)
- Confirma la URL del API_URL en admin.html

### Error al crear registro
- Verifica que todos los campos requeridos estén llenos
- Revisa las validaciones del modelo Sequelize
- Confirma que los tipos de datos sean correctos

## 📈 Mejoras Futuras

- [ ] Búsqueda y filtrado avanzado
- [ ] Exportar datos a CSV/Excel
- [ ] Importar datos desde archivo
- [ ] Logs de auditoría de cambios
- [ ] Gráficos y visualizaciones
- [ ] Backup/Restore de base de datos
- [ ] Editor SQL con syntax highlighting
- [ ] Relaciones visuales entre tablas
- [ ] Historial de cambios
- [ ] Modo dark/light

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025  
**Autor**: MVPicks Development Team
