/**
 * Script para sincronizar modelos de Sequelize con la base de datos
 * 
 * IMPORTANTE: Este script solo AGREGA columnas nuevas, NO elimina columnas existentes
 * Es seguro ejecutarlo en producción
 * 
 * Uso:
 *   node sync-models.js
 */

const { sequelize } = require('./src/models');

async function syncModels() {
  try {
    console.log('🔄 Iniciando sincronización de modelos...');
    
    // alter: true solo agrega columnas nuevas, NO elimina existentes
    // Es más seguro que force: true que eliminaría todas las tablas
    await sequelize.sync({ alter: true });
    
    console.log('✅ Modelos sincronizados exitosamente');
    console.log('📋 Cambios aplicados:');
    console.log('   - Columna "favoriteTeam" agregada a tabla Users (si no existía)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
    process.exit(1);
  }
}

syncModels();
