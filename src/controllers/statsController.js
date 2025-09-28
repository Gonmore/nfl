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
      points: totalScoresMap[m.userId] || 0
    })).sort((a, b) => b.points - a.points);

    res.json({ weekly, total });
  } catch (error) {
    console.error('Error in getLeagueStats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
  }
};

async function calculateScores(leagueId, week) {
  // Check if scores already calculated for this week
  const existing = await Score.findOne({ where: { leagueId, week } });
  if (existing) return;

  // Get all games for the week to find the last one
  const games = await Game.findAll({ where: { week }, order: [['date', 'DESC']] });
  const lastGameDate = games[0]?.date;

  // Get all picks for the league and week
  const picks = await Pick.findAll({
    where: { leagueId, week },
    include: [Game]
  });

  // Group by user
  const userScores = {};

  for (const pick of picks) {
    const userId = pick.userId;
    if (!userScores[userId]) userScores[userId] = 0;

    if (pick.Game.winner && pick.pick === pick.Game.winner) {
      const gameDate = new Date(pick.Game.date);
      const day = gameDate.getDay(); // 0=Sun, 1=Mon, 4=Thu, 6=Sat
      let points = 0;

      if (day === 4) { // Thursday
        points = 1;
      } else if (day === 6) { // Saturday
        points = 2;
      } else if (day === 0) { // Sunday
        // Check if it's the last game
        if (pick.Game.date.getTime() === lastGameDate?.getTime()) {
          points = 3;
        } else {
          points = 2;
        }
      } else if (day === 1) { // Monday
        points = 3;
      }

      userScores[userId] += points;
    }
  }

  // Save scores
  for (const userId in userScores) {
    await Score.upsert({
      userId: parseInt(userId),
      leagueId: parseInt(leagueId),
      week: parseInt(week),
      points: userScores[userId]
    });
  }
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

      if (pick.Game.winner && pick.pick === pick.Game.winner) {
        correct = true;
        if (day === 4) { // Thursday
          points = 1;
        } else if (day === 6) { // Saturday
          points = 2;
        } else if (day === 0) { // Sunday
          if (pick.Game.date.getTime() === lastGameDate?.getTime()) {
            points = 3;
          } else {
            points = 2;
          }
        } else if (day === 1) { // Monday
          points = 3;
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
        date: pick.Game.date
      };
    });

    res.json({ details });
  } catch (error) {
    console.error('Error in getUserPicksDetails:', error);
    res.status(500).json({ message: 'Error al obtener detalles de picks.', error: error.message });
  }
};

module.exports = { getLeagueStats, getUserPicksDetails, calculateScores };
