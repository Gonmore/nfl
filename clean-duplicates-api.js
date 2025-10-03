require('dotenv').config();
const axios = require('axios');

// Script para ejecutar limpieza de duplicados via API
// Requiere que el servidor esté corriendo

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://tu-dominio.com/api'
  : 'http://localhost:3000/api';

const ADMIN_TOKEN = process.argv[2]; // Pasar token como argumento

if (!ADMIN_TOKEN) {
  console.error('❌ Uso: node clean-duplicates-api.js <ADMIN_TOKEN>');
  console.error('   Obtén el token desde el navegador (localStorage) como usuario admin');
  process.exit(1);
}

async function cleanDuplicatesViaAPI() {
  try {
    console.log('🧹 Ejecutando limpieza de duplicados via API...');

    const response = await axios.post(`${API_BASE}/stats/clean-duplicates`, {}, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Limpieza completada exitosamente!');
      console.log(`📊 Estadísticas:`);
      console.log(`   - Picks duplicados eliminados: ${response.data.stats.picksDeleted}`);
      console.log(`   - Scores duplicados eliminados: ${response.data.stats.scoresDeleted}`);
      console.log(`   - Total eliminados: ${response.data.stats.totalDeleted}`);
    } else {
      console.error('❌ Error en la limpieza:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error ejecutando limpieza via API:', error.response?.data || error.message);
  }
}

cleanDuplicatesViaAPI();