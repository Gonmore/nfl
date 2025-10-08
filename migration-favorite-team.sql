-- ============================================
-- MIGRACIÓN: Agregar campo favoriteTeam
-- Fecha: Octubre 2025
-- Descripción: Agrega columna para equipo favorito
--              con bonus de Super Bowl
-- ============================================

-- Para PostgreSQL (Local y Producción)
-- --------------------------------------------

-- Agregar la columna (si no existe)
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "favoriteTeam" VARCHAR(255);

-- Verificar que se agregó correctamente
SELECT 
    column_name as "Columna", 
    data_type as "Tipo", 
    is_nullable as "Nullable",
    character_maximum_length as "Longitud"
FROM information_schema.columns 
WHERE table_name = 'Users' 
AND column_name = 'favoriteTeam';

-- Ver algunos datos de ejemplo
SELECT 
    id,
    username,
    "favoriteTeam"
FROM "Users"
LIMIT 5;

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Esta migración es segura y puede ejecutarse 
--    múltiples veces sin problemas
-- 2. No afecta datos existentes
-- 3. La columna es nullable, por lo que usuarios
--    existentes no necesitan tener un equipo
-- 4. El valor por defecto es NULL
-- ============================================
