# CartelNFL Backend

API para el juego de picks NFL con ligas privadas.

## Endpoints principales

### Autenticación
- `POST /auth/register` — Registro de usuario (username, email, password)
- `POST /auth/login` — Login (email, password)

### Ligas
- `POST /leagues/create` — Crear liga (requiere JWT)
- `POST /leagues/join` — Unirse a liga (requiere JWT)
- `GET /leagues/:leagueId/members` — Ver miembros de liga (requiere JWT)

### Partidos NFL
- `POST /nfl/games/sync` — Sincronizar partidos desde ESPN (solo admin, requiere JWT)
- `GET /nfl/games/current` — Ver partidos de la semana actual (requiere JWT)

### Picks
- `POST /picks/make` — Hacer picks de la semana (requiere JWT)
- `GET /picks/user?leagueId=...&week=...` — Ver picks del usuario (requiere JWT)
- `GET /picks/league?leagueId=...&week=...` — Ver picks de la liga (requiere JWT)

### Estadísticas
- `GET /stats/league?leagueId=...&week=...` — Ver puntos por usuario en la liga y GW (requiere JWT)
- `GET /stats/league/totals?leagueId=...` — Ver puntos totales por usuario en la liga (requiere JWT)

## Autenticación
- Todas las rutas (excepto registro/login) requieren el header: `Authorization: Bearer <token>`

## Variables de entorno
Ver archivo `.env` para configuración de Postgres, JWT y ESPN API.

---

Listo para conectar el frontend.
