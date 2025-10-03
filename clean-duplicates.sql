-- Script SQL para limpiar duplicados en producción
-- Ejecutar con precaución - HACER BACKUP ANTES

-- 1. Limpiar duplicados en Picks (mantener el registro más reciente por userId, gameId, leagueId)
DELETE FROM "Picks"
WHERE id NOT IN (
    SELECT DISTINCT ON ("userId", "gameId", "leagueId") id
    FROM "Picks"
    ORDER BY "userId", "gameId", "leagueId", id DESC
);

-- 2. Limpiar duplicados en Scores (mantener el registro más reciente por userId, leagueId, week)
DELETE FROM "Scores"
WHERE id NOT IN (
    SELECT DISTINCT ON ("userId", "leagueId", "week") id
    FROM "Scores"
    ORDER BY "userId", "leagueId", "week", id DESC
);

-- Verificar que no queden duplicados
SELECT 'Picks duplicates:' as table_name, COUNT(*) as duplicates
FROM "Picks" p1
WHERE (SELECT COUNT(*) FROM "Picks" p2
       WHERE p2."userId" = p1."userId"
       AND p2."gameId" = p1."gameId"
       AND p2."leagueId" = p1."leagueId") > 1

UNION ALL

SELECT 'Scores duplicates:' as table_name, COUNT(*) as duplicates
FROM "Scores" s1
WHERE (SELECT COUNT(*) FROM "Scores" s2
       WHERE s2."userId" = s1."userId"
       AND s2."leagueId" = s1."leagueId"
       AND s2."week" = s1."week") > 1;