require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkDuplicates() {
  try {
    console.log('🔍 Verificando duplicados en la base de datos...\n');

    // Verificar duplicados en Picks
    const pickDuplicates = await sequelize.query(`
      SELECT "userId", "gameId", "leagueId", COUNT(*) as count
      FROM "Picks"
      GROUP BY "userId", "gameId", "leagueId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('📊 Duplicados en Picks:');
    if (pickDuplicates.length === 0) {
      console.log('   ✅ No hay duplicados');
    } else {
      console.log(`   ❌ Encontrados ${pickDuplicates.length} grupos de duplicados:`);
      pickDuplicates.forEach((dup, index) => {
        console.log(`      ${index + 1}. User ${dup.userId}, Game ${dup.gameId}, League ${dup.leagueId}: ${dup.count} registros`);
      });
    }

    // Verificar duplicados en Scores
    const scoreDuplicates = await sequelize.query(`
      SELECT "userId", "leagueId", "week", COUNT(*) as count
      FROM "Scores"
      GROUP BY "userId", "leagueId", "week"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📊 Duplicados en Scores:');
    if (scoreDuplicates.length === 0) {
      console.log('   ✅ No hay duplicados');
    } else {
      console.log(`   ❌ Encontrados ${scoreDuplicates.length} grupos de duplicados:`);
      scoreDuplicates.forEach((dup, index) => {
        console.log(`      ${index + 1}. User ${dup.userId}, League ${dup.leagueId}, Week ${dup.week}: ${dup.count} registros`);
      });
    }

    // Estadísticas generales
    const [pickStats] = await sequelize.query(`
      SELECT COUNT(*) as total FROM "Picks"
    `, { type: sequelize.QueryTypes.SELECT });

    const [scoreStats] = await sequelize.query(`
      SELECT COUNT(*) as total FROM "Scores"
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📈 Estadísticas generales:');
    console.log(`   - Total Picks: ${pickStats.total}`);
    console.log(`   - Total Scores: ${scoreStats.total}`);

    if (pickDuplicates.length === 0 && scoreDuplicates.length === 0) {
      console.log('\n🎉 ¡Base de datos limpia! No hay duplicados.');
    } else {
      console.log(`\n⚠️  Se encontraron ${pickDuplicates.length + scoreDuplicates.length} grupos de duplicados que necesitan limpieza.`);
    }

  } catch (error) {
    console.error('❌ Error verificando duplicados:', error);
  } finally {
    await sequelize.close();
  }
}

checkDuplicates();