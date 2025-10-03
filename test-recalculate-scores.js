// Script para probar el endpoint de recálculo de puntos
// Ejecutar con: node test-recalculate-scores.js

const API_URL = 'http://localhost:5001'; // Cambiar según tu configuración
const TEST_TOKEN = 'tu_token_jwt_aqui'; // Obtener desde el login

async function testRecalculateScores() {
  console.log('🧪 Probando endpoint de recálculo de puntos...\n');

  // Ejemplo 1: Recalcular una liga específica y semana específica
  console.log('📊 Ejemplo 1: Recalcular liga 1, semana 5');
  try {
    const response1 = await fetch(`${API_URL}/stats/recalculate-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        leagueId: 1,
        week: 5
      })
    });
    const result1 = await response1.json();
    console.log('Resultado:', result1);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Ejemplo 2: Recalcular todas las semanas de una liga
  console.log('📊 Ejemplo 2: Recalcular todas las semanas de liga 1');
  try {
    const response2 = await fetch(`${API_URL}/stats/recalculate-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        leagueId: 1
        // Sin especificar week = todas las semanas
      })
    });
    const result2 = await response2.json();
    console.log('Resultado:', result2);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Ejemplo 3: Recalcular todas las ligas del usuario
  console.log('📊 Ejemplo 3: Recalcular todas las ligas del usuario');
  try {
    const response3 = await fetch(`${API_URL}/stats/recalculate-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        allLeagues: true
      })
    });
    const result3 = await response3.json();
    console.log('Resultado:', result3);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testRecalculateScores().catch(console.error);
}

module.exports = { testRecalculateScores };