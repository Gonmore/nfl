# Panel de Administración de Base de Datos - Frontend

## 📋 Resumen

Se ha integrado el panel de administración de la base de datos directamente en el frontend de React, permitiendo acceso desde el Dashboard principal sin necesidad de archivos HTML externos.

## 🎯 Acceso

### Desde el Dashboard
1. Inicia sesión en la aplicación
2. Haz clic en tu perfil (esquina superior derecha)
3. Selecciona **"🔧 Panel de Administración"**

### Requisitos de Acceso
- Usuario debe estar autenticado (JWT token válido)
- Usuario debe ser **administrador global**:
  - `userId === 1` ó
  - `username === 'admin'`

Si no cumples estos requisitos, verás un mensaje: "⚠️ Acceso Denegado"

## 🎨 Componente Principal

### `AdminPanel.jsx`
Componente React completo que proporciona:

**Características:**
- ✅ **Dashboard de Estadísticas**: Visualiza total de registros por tabla
- ✅ **Navegación por Tablas**: 8 tablas disponibles (Users, Leagues, Games, Picks, etc.)
- ✅ **CRUD Completo**: Crear, Editar, Eliminar registros
- ✅ **Consultas SQL**: Ejecutor de queries SELECT
- ✅ **Paginación**: Navegación por páginas de datos
- ✅ **Diseño Responsivo**: Glassmorphism con tema oscuro NFL

**Props:**
```jsx
<AdminPanel 
  token={string}      // JWT token del usuario
  onClose={function}  // Callback para cerrar el panel
/>
```

## 🔧 Funcionalidades

### 1. Dashboard Principal
- Muestra tarjetas con conteo de registros por tabla
- Sección de consultas SQL personalizadas
- Grid de tablas disponibles

### 2. Vista de Tabla
Al seleccionar una tabla:
- **Botón "Volver"**: Regresa al dashboard
- **Botón "Crear"**: Abre modal para nuevo registro
- **Tabla de Datos**: Muestra todos los campos
- **Acciones por Fila**:
  - ✏️ Editar: Abre modal con datos precargados
  - 🗑️ Eliminar: Solicita confirmación

### 3. Modal Crear/Editar
- Formulario dinámico basado en el esquema de la tabla
- Excluye campos auto-generados (id, createdAt, updatedAt)
- Marca campos requeridos con asterisco (*)
- Validación automática de campos obligatorios

### 4. Ejecutor SQL
- Textarea para escribir consultas
- **Solo permite SELECT** (por seguridad)
- Muestra resultados en tabla
- Contador de resultados

### 5. Paginación
- Navegación por páginas numéricas
- 50 registros por página por defecto
- Página actual destacada en azul

## 📁 Archivos Modificados

### Frontend
```
nfl/frontend/src/
├── components/
│   └── AdminPanel.jsx          ← NUEVO: Componente del panel
├── Dashboard.jsx                ← MODIFICADO: Agregado botón de acceso
└── api.js                       ← Sin cambios (usa endpoints existentes)
```

### Cambios en Dashboard.jsx
1. **Import**: Agregado `import AdminPanel from './components/AdminPanel.jsx';`
2. **Estado**: `const [showAdminPanel, setShowAdminPanel] = useState(false);`
3. **Renderizado**: Muestra AdminPanel cuando `showAdminPanel === true`
4. **Botón**: Agregado en el menú de perfil

## 🎯 API Endpoints Usados

Todos los endpoints requieren autenticación JWT y permisos de admin:

```javascript
GET    /admin/stats                    // Estadísticas generales
GET    /admin/tables                   // Lista de tablas
GET    /admin/tables/:table/schema     // Esquema de tabla
GET    /admin/tables/:table            // Datos de tabla (con paginación)
GET    /admin/tables/:table/:id        // Un registro específico
POST   /admin/tables/:table            // Crear registro
PUT    /admin/tables/:table/:id        // Actualizar registro
DELETE /admin/tables/:table/:id        // Eliminar registro
POST   /admin/query                    // Ejecutar query SQL
```

## 🔒 Seguridad

### Frontend
- Verifica permisos al montar el componente
- Muestra mensaje de acceso denegado si falla
- Incluye token JWT en todas las peticiones

### Backend (ya implementado)
- Middleware `isGlobalAdmin` en todas las rutas
- Validación de userId === 1 o username === 'admin'
- Queries SQL restringidas a SELECT
- Sanitización de inputs en Sequelize

## 🎨 Diseño

### Tema Visual
- **Paleta de Colores**:
  - Fondo: Gradiente oscuro `#1a1a2e` → `#16213e`
  - Acentos: Azul cyan `#00d9ff`
  - Contenedores: Glassmorphism con blur
  
### Componentes Visuales
- **Tarjetas de Estadísticas**: Grid responsivo
- **Botones**: Gradientes con efectos hover
- **Tablas**: Diseño limpio con bordes translúcidos
- **Modals**: Centrados con overlay oscuro
- **Mensajes**: Toast notifications en rojo/verde

## 📱 Responsive Design

- Funciona en desktop y tablet
- Grid adapta columnas según espacio disponible
- Tabla con scroll horizontal en pantallas pequeñas
- Modal ajusta height máximo al 80% de viewport

## 🚀 Uso Rápido

```jsx
// En Dashboard.jsx ya está integrado
// El usuario solo necesita:

1. Login como admin
2. Clic en avatar → "Panel de Administración"
3. Explorar tablas, crear/editar/eliminar datos
4. Ejecutar queries SQL si necesario
5. Clic en "Volver al Dashboard" para salir
```

## 🐛 Manejo de Errores

### Mensajes de Error Comunes
- ❌ "No tienes permisos de administrador" → Usuario no es admin
- ❌ "Error al cargar estadísticas" → Problema de conexión o backend
- ❌ "Error al guardar" → Validación fallida o datos inválidos
- ❌ "Error de conexión" → Backend no responde

### Mensajes de Éxito
- ✅ "Registro creado"
- ✅ "Registro actualizado"
- ✅ "Registro eliminado"
- ✅ "X resultados" (después de query SQL)

## 📊 Tablas Disponibles

1. **users** - Usuarios del sistema
2. **leagues** - Ligas creadas
3. **leagueMembers** - Membresías de ligas
4. **games** - Partidos NFL
5. **picks** - Picks de usuarios
6. **scores** - Puntuaciones
7. **invitationTokens** - Tokens de invitación
8. **adminPicks** - Picks hechos por admins

## 🔄 Flujo de Trabajo Típico

### Ver Datos
1. Dashboard → Clic en tabla (ej: "Usuarios")
2. Navegar por páginas si hay muchos registros
3. Ver todos los campos de cada registro

### Editar Registro
1. En vista de tabla → Clic en ✏️
2. Modal abre con datos precargados
3. Modificar campos necesarios
4. Clic en "Guardar"
5. Confirmación y recarga automática

### Crear Registro
1. En vista de tabla → Clic en "+ Crear"
2. Modal abre vacío
3. Llenar campos (respetando requeridos *)
4. Clic en "Guardar"
5. Confirmación y recarga automática

### Eliminar Registro
1. En vista de tabla → Clic en 🗑️
2. Confirmar en diálogo
3. Eliminación y recarga automática

### Query SQL
1. En dashboard → Sección "Consulta SQL"
2. Escribir SELECT query
3. Clic en "Ejecutar Consulta"
4. Ver resultados en tabla

## ⚠️ Consideraciones Importantes

1. **Solo admins globales** pueden acceder
2. **Cambios son permanentes** - ten cuidado al editar/eliminar
3. **Queries SQL limitadas a SELECT** - no se permiten INSERT/UPDATE/DELETE
4. **Paginación**: Para tablas grandes, navega por páginas
5. **Timestamps**: createdAt y updatedAt se gestionan automáticamente

## 🎓 Ventajas vs HTML Estático

✅ **Integrado en la app** - No necesitas abrir archivo separado  
✅ **Misma sesión** - Usa el token de login actual  
✅ **Mejor UX** - Diseño consistente con el resto de la app  
✅ **Responsive** - Se adapta al diseño principal  
✅ **Mantenible** - Todo en el mismo stack de React  

## 📝 Próximas Mejoras Sugeridas

- [ ] Búsqueda/filtrado dentro de tablas
- [ ] Ordenamiento por columnas
- [ ] Export de datos a CSV/JSON
- [ ] Logs de auditoría para cambios
- [ ] Validación avanzada por tipo de campo
- [ ] Relaciones entre tablas visualizadas
- [ ] Modo oscuro/claro toggle

---

**Listo para usar!** 🎉 Solo inicia sesión como admin y accede desde el menú de perfil.
