const { syncGamesForCurrentWeek } = require('../services/espnService');
const Game = require('../models/Game');
const { Op } = require('sequelize');

// Sincroniza partidos de la semana actual desde ESPN
const syncGames = async (req, res) => {
  try {
    const games = await syncGamesForCurrentWeek();
    return res.json({ games });
  } catch (error) {
    return res.status(500).json({ message: 'Error al sincronizar partidos.', error });
  }
};

// Obtiene partidos de la semana actual desde la BD
const getGames = async (req, res) => {
  try {
    const now = new Date();
    console.log('[DEBUG] Fecha actual:', now.toISOString());
    // Buscar el partido más próximo y tomar su semana
  const nextGame = await Game.findOne({ where: { date: { [Op.gte]: now } }, order: [['date', 'ASC']] });
    let week;
    if (nextGame) {
      week = nextGame.week;
      console.log('[DEBUG] Semana próxima encontrada:', week);
    } else {
      // Si no hay próximos, toma la última semana jugada
      week = await Game.max('week');
      console.log('[DEBUG] No hay próximos, semana máxima:', week);
    }
    const games = await Game.findAll({ where: { week } });
    console.log('[DEBUG] Partidos encontrados:', games.length);
    return res.json({ games });
  } catch (error) {
    console.error('[DEBUG] Error en getGames:', error);
    return res.status(500).json({ message: 'Error al obtener partidos.', error });
  }
};

// Obtiene partidos de una semana específica
const getGamesByWeek = async (req, res) => {
  try {
    const { week } = req.params;
    const games = await Game.findAll({ where: { week: parseInt(week) } });
    return res.json({ games });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener partidos.', error });
  }
};

module.exports = { syncGames, getGames, getGamesByWeek };
