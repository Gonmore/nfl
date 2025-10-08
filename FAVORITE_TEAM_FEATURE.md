# 🏈 Feature: Equipo Favorito con Bonus de Super Bowl

## Descripción
Nueva funcionalidad que permite a los usuarios seleccionar un equipo favorito NFL y obtener puntos bonus si ese equipo llega al Super Bowl.

## Cambios Realizados

### 1. Frontend (Dashboard.jsx)

#### Modal de Edición de Perfil Mejorado:
- ✅ **Scroll agregado**: El modal ahora tiene `maxHeight: '90vh'` y `overflowY: 'auto'` para permitir ver todos los elementos
- ✅ **Opciones de cámara y galería**: 
  - Botón "🖼️ Galería" para seleccionar de la galería
  - Botón "📷 Cámara" para tomar foto desde la cámara
  - Input con `capture="environment"` para acceso a cámara
- ✅ **Selector de equipo favorito**:
  - Lista desplegable con todos los equipos NFL
  - Logos de equipos mostrados
  - Búsqueda visual con scroll
- ✅ **Logo en foto de perfil**:
  - El logo del equipo favorito aparece en la esquina inferior derecha de la foto de perfil
  - Badge circular con borde azul
- ✅ **Indicador de bonus**:
  - Muestra "⭐ +10 pts si va al Super Bowl" cuando hay equipo seleccionado
- ✅ **Fix de showToast**: Agregado como prop para eliminar el error

### 2. Backend

#### Modelo User (src/models/User.js):
```javascript
favoriteTeam: { type: DataTypes.STRING, allowNull: true }
```

#### Controller (src/controllers/authController.js):
- Actualizado `updateProfile` para aceptar y guardar `favoriteTeam`
- Respuesta incluye `favoriteTeam` en el objeto user

### 3. Base de Datos

#### Opción A: Query SQL Directo (Recomendado para producción)
```sql
-- Para PostgreSQL
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "favoriteTeam" VARCHAR(255);

-- Verificar
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Users' 
AND column_name = 'favoriteTeam';
```

#### Opción B: Script de Sincronización (Para desarrollo)
```bash
# Este script sincroniza todos los modelos con la DB
# Solo AGREGA columnas nuevas, NO elimina existentes
node sync-models.js
```

**Nota**: Para bases de datos nuevas, Sequelize creará automáticamente la columna `favoriteTeam` al hacer `sequelize.sync()` en el inicio de la aplicación, ya que el modelo User.js ya incluye este campo.

## Cómo Ejecutar los Cambios

### En Base de Datos Local:
```sql
-- Conectar a tu base de datos local y ejecutar:
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "favoriteTeam" VARCHAR(255);
```

### En Base de Datos de Producción:
```sql
-- Conectar a tu base de datos de producción y ejecutar:
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "favoriteTeam" VARCHAR(255);
```

### Verificación:
```sql
-- Verificar que la columna existe en ambas bases de datos:
SELECT * FROM "Users" LIMIT 1;
```

## Lógica de Bonus de Super Bowl (Pendiente de Implementar)

### Cuando implementar:
Al final de la temporada, cuando se determine el ganador del Super Bowl.

### Implementación sugerida:

1. **Tabla de configuración de temporada**:
```sql
CREATE TABLE season_config (
  id INTEGER PRIMARY KEY,
  year INTEGER,
  super_bowl_winner VARCHAR(255),
  super_bowl_date DATE
);
```

2. **Función para otorgar bonus**:
```javascript
async function awardSuperBowlBonus(winningTeam) {
  // Encontrar todos los usuarios con ese equipo favorito
  const users = await User.findAll({
    where: { favoriteTeam: winningTeam }
  });

  // Por cada usuario, agregar 10 puntos a su score total en todas las ligas
  for (const user of users) {
    const userLeagues = await LeagueMember.findAll({
      where: { userId: user.id }
    });

    for (const membership of userLeagues) {
      // Crear registro especial de bonus
      await Score.create({
        userId: user.id,
        leagueId: membership.leagueId,
        week: 'SUPER_BOWL_BONUS',
        points: 10,
        description: `Bonus: ${winningTeam} ganó el Super Bowl! 🏆`
      });
    }
  }
}
```

3. **Endpoint para admin**:
```javascript
// POST /admin/award-super-bowl-bonus
router.post('/admin/award-super-bowl-bonus', authMiddleware, async (req, res) => {
  const { winningTeam } = req.body;
  
  // Verificar que el usuario sea admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  await awardSuperBowlBonus(winningTeam);
  res.json({ message: 'Bonus otorgado exitosamente' });
});
```

## UI/UX Mejorada

### Foto de Perfil con Logo:
```
┌─────────────────┐
│                 │
│   Foto Usuario  │
│                 │
│              ┌──┐
└──────────────│🏈│
               └──┘
```

### Selector de Equipo:
- Dropdown con scroll
- Logos visibles
- Highlight del equipo seleccionado
- Búsqueda visual rápida

## Testing

### Frontend:
1. Abrir modal de edición de perfil
2. Verificar que se puede hacer scroll hasta ver los botones
3. Probar botón "Galería" - debe abrir selector de archivos
4. Probar botón "Cámara" - debe solicitar acceso a cámara
5. Seleccionar un equipo
6. Verificar que el logo aparece en la foto de perfil
7. Guardar y verificar que se actualiza correctamente

### Backend:
```bash
# Test con curl
curl -X PUT http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "favoriteTeam": "Kansas City Chiefs"
  }'
```

## Próximos Pasos

1. ✅ Modelo de base de datos actualizado
2. ✅ Frontend con selector de equipo
3. ✅ Logo en foto de perfil
4. ⏳ **Ejecutar query SQL en bases de datos** (ver `migration-favorite-team.sql`)
5. ⏳ Implementar lógica de bonus de Super Bowl
6. ⏳ Crear panel de admin para otorgar bonus
7. ⏳ Agregar notificación cuando un usuario recibe el bonus
8. ⏳ Mostrar indicador especial en el perfil de usuarios que ganaron bonus

## Instrucciones para Despliegue

### Paso 1: Actualizar Base de Datos
```bash
# Opción A: Ejecutar el archivo SQL directamente
psql -h localhost -U tu_usuario -d tu_base_de_datos -f migration-favorite-team.sql

# Opción B: Copiar y pegar el query en tu cliente de PostgreSQL
# Ver archivo: migration-favorite-team.sql
```

### Paso 2: Deploy del Backend
```bash
# El backend ya incluye los cambios en:
# - src/models/User.js
# - src/controllers/authController.js

# Hacer deploy normal
git push origin main
```

### Paso 3: Deploy del Frontend
```bash
# El frontend ya incluye los cambios en:
# - Dashboard.jsx (ProfileModal actualizado)

# Hacer deploy normal
# Render/Netlify/Vercel se encargará del build
```

## Notas Técnicas

- El logo del equipo se muestra usando `teamLogos` importado de `teamLogos.js`
- La captura de foto usa `capture="environment"` para cámara trasera en móviles
- El scroll del modal permite ver contenido en pantallas pequeñas
- El componente es responsive y funciona en móviles y desktop
