const Pick = require('../models/Pick');
const Game = require('../models/Game');
const Score = require('../models/Score');
const LeagueMember = require('../models/LeagueMember');
const User = require('../models/User');

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

  // Get all games for the week to find the last one
  const games = await Game.findAll({ where: { week }, order: [['date', 'DESC']] });
  console.log(`[calculateScores] Found ${games.length} games for week ${week}`);
  const lastGameDate = games[0]?.date;

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

    console.log(`[calculateScores] Processing pick for user ${userId}: game ${pick.gameId}, status: ${pick.Game.status}, winner: ${pick.Game.winner}`);

    // Only process finished games (STATUS_FINAL)
    if (pick.Game.status === 'STATUS_FINAL') {
      const gameDate = new Date(pick.Game.date);
      const day = gameDate.getDay(); // 0=Sun, 1=Mon, 4=Thu
      let points = 0;

      if (pick.Game.winner === null) {
        // Tie game - everyone gets 1 point
        points = 1;
        console.log(`[calculateScores] Tie game detected for user ${userId}, awarding 1 point`);
      } else if (pick.pick === pick.Game.winner) {
        // Normal game with winner - award points based on day
        if (day === 4) { // Thursday
          points = 1;
        } else if (day === 0) { // Sunday
          // Check if it's the last (featured) game of Sunday
          if (pick.Game.date.getTime() === lastGameDate?.getTime()) {
            points = 3; // Featured Sunday game
          } else {
            points = 2; // Regular Sunday games
          }
        } else if (day === 1) { // Monday
          points = 3;
        }
        console.log(`[calculateScores] Correct pick for user ${userId}, day ${day}, awarding ${points} points`);
      }

      userScores[userId] += points;
    } else {
      console.log(`[calculateScores] Game not finished for user ${userId}: status ${pick.Game.status}`);
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

    // Get the last game date for the week
    const games = await Game.findAll({ where: { week }, order: [['date', 'DESC']] });
    const lastGameDate = games[0]?.date;

    const details = picks.map(pick => {
      const gameDate = new Date(pick.Game.date);
      const day = gameDate.getDay();
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
          } else if (day === 0) { // Sunday
            if (pick.Game.date.getTime() === lastGameDate?.getTime()) {
              points = 3; // Featured Sunday game
            } else {
              points = 2; // Regular Sunday games
            }
          } else if (day === 1) { // Monday
            points = 3;
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

module.exports = { getLeagueStats, getUserPicksDetails, calculateScores, cleanDuplicates };
