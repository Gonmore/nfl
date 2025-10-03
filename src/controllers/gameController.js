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
    const nextGame = await Game.findOne({
      where: { date: { [Op.gte]: now } },
      order: [['date', 'ASC']]
    });

    let currentWeek, nextWeek;
    if (nextGame) {
      currentWeek = nextGame.week;
      console.log('[DEBUG] Semana próxima encontrada:', currentWeek);

      // Verificar si ya pasaron los picks de la semana actual
      const currentWeekGames = await Game.findAll({ where: { week: currentWeek } });
      const deadline = currentWeekGames.length > 0 ? new Date(Math.min(...currentWeekGames.map(g => new Date(g.date)))) : null;

      // Si ya pasó la fecha límite de la semana actual, incluir también la siguiente semana
      if (deadline && now > deadline) {
        nextWeek = currentWeek + 1;
        console.log('[DEBUG] Fecha límite pasada, incluyendo semana siguiente:', nextWeek);
      }
    } else {
      // Si no hay próximos, toma la última semana jugada
      currentWeek = await Game.max('week');
      console.log('[DEBUG] No hay próximos, semana máxima:', currentWeek);
    }

    // Obtener partidos de la(s) semana(s) relevante(s)
    let whereCondition = { week: currentWeek };
    if (nextWeek) {
      whereCondition = { week: { [Op.in]: [currentWeek, nextWeek] } };
    }

    const games = await Game.findAll({
      where: whereCondition,
      order: [['date', 'ASC']]
    });

    console.log('[DEBUG] Partidos encontrados:', games.length, 'semanas:', currentWeek, nextWeek || 'N/A');
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
