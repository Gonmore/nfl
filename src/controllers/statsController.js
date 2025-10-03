const Pick = require('../models/Pick');
const Game = require('../models/Game');
const Score = require('../models/Score');
const LeagueMember = require('../models/LeagueMember');
const User = require('../models/User');
const { Op } = require('sequelize');

const getLeagueStats = async (req, res) => {
  try {
    const { leagueId, week } = req.query;
    // Calculate scores for the week if not already calculated
    await calculateScores(leagueId, week);

    // Get all league members
    const members = await LeagueMember.findAll({ where: { leagueId }, include: User });

    // Get weekly scores
    const weeklyScoresRaw = await Score.findAll({
      where: { leagueId, week },
      include: User
    });

    console.log('weeklyScoresRaw for week', week, ':', weeklyScoresRaw.map(s => ({ userId: s.userId, points: s.points })));

    // Map to user scores
    const weeklyScoresMap = {};
    weeklyScoresRaw.forEach(s => {
      weeklyScoresMap[s.userId] = s.points;
    });

    const weekly = members.map(m => ({
      userId: m.userId,
      user: m.User.username,
      profileImage: m.User.profileImage,
      points: weeklyScoresMap[m.userId] || 0
    })).sort((a, b) => b.points - a.points);

    // Get total scores
    const totalScoresRaw = await Score.findAll({
      where: { leagueId },
      include: User,
      attributes: [
        'userId',
        [Score.sequelize.fn('SUM', Score.sequelize.col('points')), 'totalPoints']
      ],
      group: ['userId', 'User.id', 'User.username', 'User.email']
    });

    console.log('totalScoresRaw:', totalScoresRaw.map(s => s.dataValues));

    const totalScoresMap = {};
    totalScoresRaw.forEach(s => {
      totalScoresMap[s.userId] = parseInt(s.dataValues.totalPoints || 0);
    });

    const total = members.map(m => ({
      userId: m.userId,
      user: m.User.username,
      profileImage: m.User.profileImage,
      points: totalScoresMap[m.userId] || 0
    })).sort((a, b) => b.points - a.points);

    res.json({ weekly, total });
  } catch (error) {
    console.error('Error in getLeagueStats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
  }
};

async function calculateScores(leagueId, week) {
  console.log(`[calculateScores] Starting calculation for league ${leagueId}, week ${week}`);

  // Check if there are finished games that need scoring
  const finishedGames = await Game.findAll({
    where: { week, status: 'STATUS_FINAL' }
  });

  if (finishedGames.length === 0) {
    console.log(`[calculateScores] No finished games for league ${leagueId}, week ${week}`);
    return;
  }

  console.log(`[calculateScores] Found ${finishedGames.length} finished games, recalculating scores for league ${leagueId}, week ${week}`);
  console.log(`[calculateScores] Finished games IDs: ${finishedGames.map(g => g.id).join(', ')}`);

  // Get all games for the week to find the last one
  const games = await Game.findAll({ where: { week }, order: [['date', 'DESC']] });
  console.log(`[calculateScores] Found ${games.length} games for week ${week}`);
  const lastGameUtc = games[0]?.date;
  const boliviaOffset = -4; // GMT-4
  const lastGameDate = lastGameUtc ? new Date(new Date(lastGameUtc).getTime() + (boliviaOffset * 60 * 60 * 1000)) : null;
  console.log(`[calculateScores] Last game date: ${lastGameDate}`);

  // Get all picks for the league and week
  const picks = await Pick.findAll({
    where: { leagueId, week },
    include: [Game]
  });

  console.log(`[calculateScores] Found ${picks.length} picks for league ${leagueId}, week ${week}`);

  // Group by user
  const userScores = {};

  for (const pick of picks) {
    const userId = pick.userId;
    if (!userScores[userId]) userScores[userId] = 0;

    console.log(`[calculateScores] Processing pick for user ${userId}: game ${pick.gameId}, pick: ${pick.pick}, status: ${pick.Game?.status}, winner: ${pick.Game?.winner}, date: ${pick.Game?.date}`);

    // Only process finished games (STATUS_FINAL)
    if (pick.Game?.status === 'STATUS_FINAL') {
      // Ajustar la fecha a zona horaria de Bolivia (GMT-4)
      const utcDate = new Date(pick.Game.date);
      const boliviaOffset = -4; // GMT-4
      const localDate = new Date(utcDate.getTime() + (boliviaOffset * 60 * 60 * 1000));
      const day = localDate.getDay(); // 0=Sun, 1=Mon, 4=Thu, 5=Fri
      let points = 0;

      console.log(`[calculateScores] Game ${pick.gameId} - Date: ${gameDate}, Day: ${day}, Last game date: ${lastGameDate}`);

      if (pick.Game.winner === null) {
        // Tie game - everyone gets 1 point
        points = 1;
        console.log(`[calculateScores] Tie game detected for user ${userId}, awarding 1 point`);
      } else if (pick.pick === pick.Game.winner) {
        // Normal game with winner - award points based on day
        if (day === 4) { // Thursday
          points = 1;
        } else if (day === 5) { // Friday
          points = 1; // Same as Thursday
        } else if (day === 0) { // Sunday
          // Check if it's the last (featured) game of Sunday
          const pickGameTime = localDate.getTime();
          const lastGameTime = lastGameDate ? lastGameDate.getTime() : null;
          if (pickGameTime === lastGameTime) {
            points = 3; // Featured Sunday game
          } else {
            points = 2; // Regular Sunday games
          }
        } else if (day === 1) { // Monday
          points = 3;
        } else {
          // Default case for any other day (Saturday, etc.)
          points = 1;
        }
        console.log(`[calculateScores] Correct pick for user ${userId}, day ${day}, awarding ${points} points`);
      } else {
        console.log(`[calculateScores] Wrong pick for user ${userId}: picked ${pick.pick}, winner was ${pick.Game.winner}`);
      }

      userScores[userId] += points;
    } else {
      console.log(`[calculateScores] Game not finished for user ${userId}: status ${pick.Game?.status}`);
    }
  }

  console.log(`[calculateScores] Final scores for league ${leagueId}, week ${week}:`, userScores);

  // Save scores for each user
  for (const userId in userScores) {
    await Score.upsert({
      userId: parseInt(userId),
      leagueId: parseInt(leagueId),
      week: parseInt(week),
      points: userScores[userId]
    });
    console.log(`[calculateScores] Saved score for user ${userId}: ${userScores[userId]} points`);
  }

  console.log(`[calculateScores] Completed calculation for league ${leagueId}, week ${week}`);
}

const getUserPicksDetails = async (req, res) => {
  try {
    const { leagueId, week, userId } = req.query;
    const currentUserId = req.user.id; // Use user ID from JWT token
    const targetUserId = userId ? parseInt(userId) : currentUserId;

    // Get picks for the user, league, week
    const picks = await Pick.findAll({
      where: { leagueId, week, userId: targetUserId },
      include: [Game]
    });

    // Get the last game date for the week (en zona horaria local)
    const games = await Game.findAll({ where: { week }, order: [['date', 'DESC']] });
    const lastGameUtc = games[0]?.date;
    const boliviaOffset = -4; // GMT-4
    const lastGameDate = lastGameUtc ? new Date(new Date(lastGameUtc).getTime() + (boliviaOffset * 60 * 60 * 1000)) : null;

    const details = picks.map(pick => {
      // Ajustar la fecha a zona horaria de Bolivia (GMT-4)
      const utcDate = new Date(pick.Game.date);
      const boliviaOffset = -4; // GMT-4
      const localDate = new Date(utcDate.getTime() + (boliviaOffset * 60 * 60 * 1000));
      const day = localDate.getDay();
      let points = 0;
      let correct = false;

      // Only process finished games
      if (pick.Game.status === 'STATUS_FINAL') {
        if (pick.Game.winner === null) {
          // Tie game - everyone gets 1 point
          points = 1;
          correct = true; // Consider it "correct" for tie games
        } else if (pick.pick === pick.Game.winner) {
          // Normal game with winner
          correct = true;
          if (day === 4) { // Thursday
            points = 1;
          } else if (day === 5) { // Friday
            points = 1; // Same as Thursday
          } else if (day === 0) { // Sunday
            if (localDate.getTime() === lastGameDate?.getTime()) {
              points = 3; // Featured Sunday game
            } else {
              points = 2; // Regular Sunday games
            }
          } else if (day === 1) { // Monday
            points = 3;
          } else {
            // Default case for any other day (Saturday, etc.)
            points = 1;
          }
        }
      }

      return {
        gameId: pick.gameId,
        homeTeam: pick.Game.homeTeam,
        awayTeam: pick.Game.awayTeam,
        pick: pick.pick,
        winner: pick.Game.winner,
        correct,
        points,
        date: pick.Game.date,
        status: pick.Game.status
      };
    });

    res.json({ details });
  } catch (error) {
    console.error('Error in getUserPicksDetails:', error);
    res.status(500).json({ message: 'Error al obtener detalles de picks.', error: error.message });
  }
};

const cleanDuplicates = async (req, res) => {
  try {
    console.log('🔍 Buscando y limpiando registros duplicados...');

    let picksDeleted = 0;
    let scoresDeleted = 0;

    // Limpiar duplicados en Picks (userId, gameId, leagueId)
    console.log('🧹 Limpiando duplicados en Picks...');
    const duplicatePicks = await Pick.sequelize.query(`
      SELECT "userId", "gameId", "leagueId", COUNT(*) as count
      FROM "Picks"
      GROUP BY "userId", "gameId", "leagueId"
      HAVING COUNT(*) > 1
    `, { type: Pick.sequelize.QueryTypes.SELECT });

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
    const duplicateScores = await Score.sequelize.query(`
      SELECT "userId", "leagueId", "week", COUNT(*) as count
      FROM "Scores"
      GROUP BY "userId", "leagueId", "week"
      HAVING COUNT(*) > 1
    `, { type: Score.sequelize.QueryTypes.SELECT });

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

    const totalDeleted = picksDeleted + scoresDeleted;

    console.log(`✅ Limpieza completada: ${totalDeleted} registros duplicados eliminados`);

    res.json({
      success: true,
      message: 'Limpieza de duplicados completada',
      stats: {
        picksDeleted,
        scoresDeleted,
        totalDeleted
      }
    });

  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar duplicados',
      error: error.message
    });
  }
};

const recalculateScores = async (req, res) => {
  try {
    const { leagueId, week, allLeagues } = req.body;
    const userId = req.user.id;

    console.log('🔄 Iniciando recálculo de puntos...');
    console.log('Parámetros:', { leagueId, week, allLeagues, userId });

    // Debug: Check specific game 65
    if (leagueId == 1) {
      const game65 = await Game.findByPk(65);
      if (game65) {
        console.log('🎯 Game 65 details:', {
          id: game65.id,
          week: game65.week,
          status: game65.status,
          winner: game65.winner,
          date: game65.date,
          homeTeam: game65.homeTeam,
          awayTeam: game65.awayTeam
        });

        // Check if user 2 has a pick for game 65
        const user2Pick = await Pick.findOne({
          where: { userId: 2, gameId: 65, leagueId: 1 },
          include: [Game]
        });
        if (user2Pick) {
          console.log('🎯 User 2 pick for game 65:', {
            pick: user2Pick.pick,
            gameWinner: user2Pick.Game?.winner,
            isCorrect: user2Pick.pick === user2Pick.Game?.winner
          });
        } else {
          console.log('🎯 User 2 has no pick for game 65');
        }
      } else {
        console.log('🎯 Game 65 not found');
      }
    }

    let leaguesToProcess = [];
    let weeksToProcess = [];

    if (allLeagues) {
      // Modo administrador: recalcular todas las ligas a las que pertenece el usuario
      console.log('👑 Modo múltiple: procesando todas las ligas del usuario');
      const userLeagues = await LeagueMember.findAll({
        where: { userId },
        attributes: ['leagueId'],
        group: ['leagueId']
      });
      leaguesToProcess = userLeagues.map(l => l.leagueId);

      // Obtener todas las semanas disponibles
      const allGames = await Game.findAll({
        attributes: ['week'],
        group: ['week'],
        order: [['week', 'ASC']]
      });
      weeksToProcess = allGames.map(g => g.week);

    } else if (leagueId) {
      // Liga específica
      leaguesToProcess = [parseInt(leagueId)];

      // Verificar que el usuario pertenece a la liga
      const membership = await LeagueMember.findOne({
        where: { leagueId: parseInt(leagueId), userId }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para recalcular puntos en esta liga'
        });
      }

      if (week) {
        // Semana específica
        weeksToProcess = [parseInt(week)];
      } else {
        // Todas las semanas de la liga
        const leagueGames = await Game.findAll({
          attributes: ['week'],
          group: ['week'],
          order: [['week', 'ASC']]
        });
        weeksToProcess = leagueGames.map(g => g.week);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Debes especificar leagueId o usar allLeagues=true'
      });
    }

    console.log(`📊 Procesando ${leaguesToProcess.length} ligas y ${weeksToProcess.length} semanas`);

    let totalProcessed = 0;
    let scoresUpdated = 0;

    // Procesar cada liga y semana
    for (const currentLeagueId of leaguesToProcess) {
      for (const currentWeek of weeksToProcess) {
        console.log(`🔄 Recalculando liga ${currentLeagueId}, semana ${currentWeek}`);
        await calculateScores(currentLeagueId, currentWeek);
        totalProcessed++;
      }
    }

    // Contar scores actualizados (aproximado)
    const recentScores = await Score.findAll({
      where: {
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 60000) // Último minuto
        }
      }
    });
    scoresUpdated = recentScores.length;

    console.log(`✅ Recálculo completado: ${totalProcessed} combinaciones procesadas, ~${scoresUpdated} scores actualizados`);

    res.json({
      success: true,
      message: 'Recálculo de puntos completado exitosamente',
      stats: {
        leaguesProcessed: leaguesToProcess.length,
        weeksProcessed: weeksToProcess.length,
        combinationsProcessed: totalProcessed,
        scoresUpdated: scoresUpdated
      }
    });

  } catch (error) {
    console.error('❌ Error recalculando puntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recalcular puntos',
      error: error.message
    });
  }
};

module.exports = { getLeagueStats, getUserPicksDetails, calculateScores, cleanDuplicates, recalculateScores };
