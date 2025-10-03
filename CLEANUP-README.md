# Limpieza de Registros Duplicados

## ⚠️ IMPORTANTE - HACER BACKUP ANTES
Antes de ejecutar cualquier limpieza, **haz un backup completo de tu base de datos**.

## Opciones Disponibles

### 1. Script Directo (Recomendado para desarrollo)
Ejecuta el script Node.js que se conecta directamente a la base de datos:

```bash
node clean-duplicates.js
```

**Ventajas:**
- ✅ Más rápido
- ✅ No requiere servidor corriendo
- ✅ Mejor control de errores
- ✅ Logging detallado

### 2. Via API (Recomendado para producción)
Usa el endpoint REST que agregamos al backend:

```bash
node clean-duplicates-api.js YOUR_ADMIN_JWT_TOKEN
```

**Ventajas:**
- ✅ Seguro (requiere autenticación)
- ✅ Puede ejecutarse remotamente
- ✅ Integrado con el sistema de logs del backend

### 3. SQL Directo (Para DBA expertos)
Ejecuta las queries SQL directamente en tu base de datos:

```sql
-- Archivo: clean-duplicates.sql
-- Copia y pega el contenido en tu cliente SQL
```

**Ventajas:**
- ✅ Máximo control
- ✅ Puedes modificar las queries
- ✅ No requiere código adicional

## Qué hace la limpieza

1. **Picks duplicados**: Elimina registros duplicados por `(userId, gameId, leagueId)`, manteniendo el más reciente
2. **Scores duplicados**: Elimina registros duplicados por `(userId, leagueId, week)`, manteniendo el más reciente

## Verificación

Después de la limpieza, ejecuta estas queries para verificar:

```sql
-- Verificar que no queden duplicados en Picks
SELECT "userId", "gameId", "leagueId", COUNT(*)
FROM "Picks"
GROUP BY "userId", "gameId", "leagueId"
HAVING COUNT(*) > 1;

-- Verificar que no queden duplicados en Scores
SELECT "userId", "leagueId", "week", COUNT(*)
FROM "Scores"
GROUP BY "userId", "leagueId", "week"
HAVING COUNT(*) > 1;
```

## Recomendaciones

- **Desarrollo**: Usa el script directo (`clean-duplicates.js`)
- **Producción**: Usa el endpoint API (`clean-duplicates-api.js`)
- **Emergencias**: SQL directo si no puedes usar los scripts

## Seguridad

- El endpoint API requiere autenticación JWT
- Los scripts incluyen logging detallado
- Se mantiene el registro más reciente en caso de duplicados
- No se eliminan datos únicos