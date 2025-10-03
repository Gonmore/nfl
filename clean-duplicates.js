require('dotenv').config();
const { sequelize } = require('./src/models');
const { Op } = require('sequelize');
const Pick = require('./src/models/Pick');
const Score = require('./src/models/Score');

async function cleanDuplicates() {
  try {
    console.log('🔍 Buscando registros duplicados...');

    // Limpiar duplicados en Picks (userId, gameId, leagueId)
    console.log('🧹 Limpiando duplicados en Picks...');
    const duplicatePicks = await sequelize.query(`
      SELECT userId, gameId, leagueId, COUNT(*) as count
      FROM "Picks"
      GROUP BY userId, gameId, leagueId
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT });

    let picksDeleted = 0;
    for (const dup of duplicatePicks) {
      // Mantener el registro más reciente (mayor ID)
      const picksToDelete = await Pick.findAll({
        where: {
          userId: dup.userId,
          gameId: dup.gameId,
          leagueId: dup.leagueId
        },
        order: [['id', 'DESC']],
        offset: 1 // Saltar el primero (el más reciente)
      });

      for (const pick of picksToDelete) {
        await pick.destroy();
        picksDeleted++;
      }
    }

    // Limpiar duplicados en Scores (userId, leagueId, week)
    console.log('🧹 Limpiando duplicados en Scores...');
    const duplicateScores = await sequelize.query(`
      SELECT userId, leagueId, week, COUNT(*) as count
      FROM "Scores"
      GROUP BY userId, leagueId, week
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT });

    let scoresDeleted = 0;
    for (const dup of duplicateScores) {
      // Mantener el registro más reciente (mayor ID)
      const scoresToDelete = await Score.findAll({
        where: {
          userId: dup.userId,
          leagueId: dup.leagueId,
          week: dup.week
        },
        order: [['id', 'DESC']],
        offset: 1 // Saltar el primero (el más reciente)
      });

      for (const score of scoresToDelete) {
        await score.destroy();
        scoresDeleted++;
      }
    }

    console.log(`✅ Limpieza completada:`);
    console.log(`   - Picks duplicados eliminados: ${picksDeleted}`);
    console.log(`   - Scores duplicados eliminados: ${scoresDeleted}`);
    console.log(`   - Total registros eliminados: ${picksDeleted + scoresDeleted}`);

  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
  } finally {
    await sequelize.close();
  }
}

cleanDuplicates();