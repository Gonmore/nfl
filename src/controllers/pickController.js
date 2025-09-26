const Pick = require('../models/Pick');
const Game = require('../models/Game');
const LeagueMember = require('../models/LeagueMember');
const Score = require('../models/Score');
const { Op } = require('sequelize');
const { calculateScores } = require('./statsController');

// Hacer picks para la semana actual
const makePicks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leagueId, picks } = req.body; // picks: [{ gameId, pick }]
    console.log('makePicks: userId', userId, 'leagueId', leagueId, 'picks', picks);
    if (!picks || picks.length === 0) {
      return res.status(400).json({ message: 'Debes seleccionar al menos un pick.' });
    }
    // Validar que el usuario es miembro de la liga
    const member = await LeagueMember.findOne({ where: { userId, leagueId } });
    console.log('member found:', member);
    if (!member) return res.status(403).json({ message: 'No eres miembro de la liga.' });
    // Validar fecha límite (antes del partido de jueves)
    const now = new Date();
    const earliestGame = await Game.findOne({ where: { week: picks[0].week }, order: [['date', 'ASC']] });
    console.log('earliestGame:', earliestGame, 'now:', now);
    if (earliestGame && now >= earliestGame.date) {
      return res.status(403).json({ message: 'Ya inició la jornada, picks cerrados.' });
    }
    // Guardar picks
    for (const p of picks) {
      console.log('Upserting pick:', { userId, leagueId, gameId: p.gameId, pick: p.pick, week: p.week });
      await Pick.upsert({ userId, leagueId, gameId: p.gameId, pick: p.pick, week: p.week });
    }

    // Calcular scores después de guardar picks
    await calculateScores(leagueId, picks[0].week);

    return res.json({ message: 'Picks guardados correctamente.' });
  } catch (error) {
    console.error('Error in makePicks:', error);
    return res.status(500).json({ message: 'Error al guardar picks.', error: error.message });
  }
};

// Consultar picks de usuario en liga
const getUserPicks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leagueId, week } = req.query;
    const picks = await Pick.findAll({ where: { userId, leagueId, week } });
    return res.json({ picks });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener picks.', error });
  }
};

// Consultar picks de todos los miembros de liga en una semana
const getLeaguePicks = async (req, res) => {
  try {
    const { leagueId, week } = req.query;
    const picks = await Pick.findAll({ where: { leagueId, week } });
    return res.json({ picks });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener picks de liga.', error });
  }
};

module.exports = { makePicks, getUserPicks, getLeaguePicks };
