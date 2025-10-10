# Endpoint /api/awake para Backend

## Instrucciones para el Backend

Agrega este endpoint simple a tu servidor Express para que la app móvil pueda verificar si el backend está despierto:

### 1. Crear archivo: `src/routes/awake.js`

```javascript
const express = require('express');
const router = express.Router();

/**
 * Endpoint simple para verificar que el backend está activo
 * Usado por la app móvil para "despertar" el servidor en Render
 */
router.get('/', (req, res) => {
  res.json({ 
    status: 'awake',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
```

### 2. Registrar la ruta en `src/index.js`

Agrega estas líneas después de las otras rutas:

```javascript
// Routes existentes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leagueRoutes = require('./routes/league');
const pickRoutes = require('./routes/pick');
const standingsRoutes = require('./routes/standings');
const statsRoutes = require('./routes/stats');

// NUEVA RUTA - Awake endpoint
const awakeRoutes = require('./routes/awake');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/picks', pickRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/stats', statsRoutes);

// NUEVA - Endpoint de wake-up
app.use('/api/awake', awakeRoutes);
```

### 3. Probar el endpoint

```bash
curl https://nfl-backend-invn.onrender.com/api/awake
```

Debería responder:
```json
{
  "status": "awake",
  "message": "Backend is running",
  "timestamp": "2025-10-08T..."
}
```

## ¿Por qué es necesario?

Render (free tier) **duerme los servidores** después de 15 minutos de inactividad.

La app móvil:
1. Al iniciar, hace ping a `/api/awake`
2. Si responde rápido (<3s) → Backend despierto, continúa normal
3. Si NO responde → Backend dormido, muestra splash screen animado
4. Mientras tanto, sigue haciendo peticiones para despertarlo
5. Cuando responde, quita el splash y carga la app

## Fallback actual

La app ya tiene un **fallback**: si `/api/awake` no existe, usa `/api/games` para despertar el backend.

**Resultado**: La app funciona ahora, pero si agregas `/api/awake` será más eficiente.

## Commit sugerido

```bash
git add src/routes/awake.js
git commit -m "feat: Add /api/awake endpoint for mobile app wake-up detection"
git push
```

Luego redeploy en Render.
