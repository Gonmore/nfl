require('dotenv').config();
const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('Ejecutando migraciones...');

    // Ejecutar migración manual para agregar profileImage
    const migrationPath = path.join(__dirname, 'migrations', 'add-profile-image-to-users.js');
    const migration = require(migrationPath);

    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('✅ Migración completada: profileImage agregado a Users');

    console.log('🎉 Todas las migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
  } finally {
    await sequelize.close();
  }
}

runMigrations();