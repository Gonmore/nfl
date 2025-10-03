# Endpoint de Recálculo de Puntos

## Descripción
Este endpoint permite recalcular los puntos de los usuarios basándose en sus picks y los resultados de los juegos.

## Endpoint
```
POST /stats/recalculate-scores
```

## Autenticación
Requiere token JWT válido en el header `Authorization: Bearer <token>`

## Parámetros (Body JSON)

### Opción 1: Liga específica, semana específica
```json
{
  "leagueId": 1,
  "week": 5
}
```

### Opción 2: Liga específica, todas las semanas
```json
{
  "leagueId": 1
}
```

### Opción 3: Todas las ligas del usuario
```json
{
  "allLeagues": true
}
```

## Permisos
- El usuario debe ser miembro de la liga especificada (para opciones 1 y 2)
- Para `allLeagues: true`, recalcula todas las ligas a las que pertenece el usuario

## Respuesta Exitosa
```json
{
  "success": true,
  "message": "Recálculo de puntos completado exitosamente",
  "stats": {
    "leaguesProcessed": 1,
    "weeksProcessed": 1,
    "combinationsProcessed": 1,
    "scoresUpdated": 5
  }
}
```

## Respuesta de Error
```json
{
  "success": false,
  "message": "Error al recalcular puntos",
  "error": "detalles del error"
}
```

## Lógica de Puntuación

### Puntos por tipo de juego:
- **Jueves (Thursday)**: 1 punto
- **Domingo regular**: 2 puntos
- **Domingo destacado** (último juego del día): 3 puntos
- **Lunes (Monday)**: 3 puntos
- **Empate**: 1 punto para todos

### Condiciones:
- Solo se puntúan juegos finalizados (`STATUS_FINAL`)
- Los picks deben coincidir con el ganador del juego
- En caso de empate, todos los usuarios reciben 1 punto

## Uso desde Frontend

```javascript
import { recalculateScores } from './api.js';

// Recalcular una liga específica y semana
const result = await recalculateScores(token, {
  leagueId: 1,
  week: 5
});

// Recalcular todas las semanas de una liga
const result = await recalculateScores(token, {
  leagueId: 1
});

// Recalcular todas las ligas del usuario
const result = await recalculateScores(token, {
  allLeagues: true
});
```

## Casos de Uso
- Corregir puntuaciones después de cambios en la lógica
- Recalcular después de corrección de resultados de juegos
- Actualizar estadísticas después de migraciones o correcciones de datos
- Verificar integridad de las puntuaciones

## Notas Técnicas
- Utiliza la función `calculateScores()` existente
- Actualiza la tabla `Scores` con `upsert()`
- Registra actividad detallada en los logs del servidor
- Es una operación idempotente (puede ejecutarse múltiples veces)