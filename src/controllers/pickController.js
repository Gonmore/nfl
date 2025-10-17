const Pick = require('../models/Pick');
const Game = require('../models/Game');
const LeagueMember = require('../models/LeagueMember');
const Score = require('../models/Score');
const League = require('../models/League');
const User = require('../models/User');
const AdminPick = require('../models/AdminPick');
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

// Verificar elegibilidad para hacer picks por otro usuario (solo admin)
const checkAdminPickEligibility = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId, leagueId, week } = req.query;

    if (!userId || !leagueId || !week) {
      return res.status(400).json({ 
        message: 'userId, leagueId y week son obligatorios.' 
      });
    }

    // Verificar que el usuario actual es admin de la liga
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'Liga no encontrada.' });
    }

    if (league.adminId !== adminId) {
      return res.status(403).json({ 
        message: 'Solo el administrador de la liga puede hacer picks por otros usuarios.' 
      });
    }

    // Verificar que el usuario objetivo es miembro de la liga
    const targetMember = await LeagueMember.findOne({ 
      where: { userId: parseInt(userId), leagueId: parseInt(leagueId) } 
    });
    if (!targetMember) {
      return res.status(404).json({ 
        message: 'El usuario no es miembro de esta liga.' 
      });
    }

    // Verificar si el usuario ya tiene picks para esta semana
    const existingPicks = await Pick.findAll({ 
      where: { 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId), 
        week: parseInt(week) 
      } 
    });

    if (existingPicks.length > 0) {
      return res.status(400).json({ 
        eligible: false,
        message: 'El usuario ya tiene picks para esta semana.',
        reason: 'HAS_PICKS'
      });
    }

    // Contar cuántas veces se ha usado esta funcionalidad para este usuario
    const adminPickCount = await AdminPick.count({
      where: { 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId)
      }
    });

    if (adminPickCount >= 3) {
      return res.status(400).json({ 
        eligible: false,
        message: 'Ya se ha utilizado el máximo de 3 veces para este usuario.',
        reason: 'MAX_USES_REACHED',
        usedCount: adminPickCount
      });
    }

    // Obtener partidos de la semana que aún no han comenzado
    const now = new Date();
    const availableGames = await Game.findAll({
      where: {
        week: parseInt(week),
        date: { [Op.gt]: now }
      },
      order: [['date', 'ASC']]
    });

    if (availableGames.length === 0) {
      return res.status(400).json({ 
        eligible: false,
        message: 'Todos los partidos de esta semana ya han comenzado.',
        reason: 'NO_AVAILABLE_GAMES'
      });
    }

    // Obtener información del usuario
    const targetUser = await User.findByPk(userId);

    // Calcular penalización
    const nextPickCount = adminPickCount + 1;
    const penalty = nextPickCount === 1 ? 0 : -3;

    return res.json({
      eligible: true,
      targetUser: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email
      },
      usedCount: adminPickCount,
      remainingUses: 3 - adminPickCount,
      nextPickCount,
      penalty,
      penaltyMessage: penalty === 0 
        ? 'Primera vez: sin penalización' 
        : `${nextPickCount === 2 ? 'Segunda' : 'Tercera'} vez: -3 puntos`,
      availableGames: availableGames.map(g => ({
        id: g.id,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        date: g.date,
        week: g.week
      }))
    });

  } catch (error) {
    console.error('Error in checkAdminPickEligibility:', error);
    return res.status(500).json({ 
      message: 'Error al verificar elegibilidad.', 
      error: error.message 
    });
  }
};

// Hacer picks por otro usuario (solo admin)
const makePicksForUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userId, leagueId, picks, week } = req.body;

    console.log('makePicksForUser:', { adminId, userId, leagueId, week, picksCount: picks?.length });

    if (!userId || !leagueId || !picks || !week || picks.length === 0) {
      return res.status(400).json({ 
        message: 'userId, leagueId, week y picks son obligatorios.' 
      });
    }

    // Verificar que el usuario actual es admin de la liga
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'Liga no encontrada.' });
    }

    if (league.adminId !== adminId) {
      return res.status(403).json({ 
        message: 'Solo el administrador de la liga puede hacer picks por otros usuarios.' 
      });
    }

    // Verificar que el usuario objetivo es miembro de la liga
    const targetMember = await LeagueMember.findOne({ 
      where: { userId: parseInt(userId), leagueId: parseInt(leagueId) } 
    });
    if (!targetMember) {
      return res.status(404).json({ 
        message: 'El usuario no es miembro de esta liga.' 
      });
    }

    // Verificar si el usuario ya tiene picks para esta semana
    const existingPicks = await Pick.findAll({ 
      where: { 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId), 
        week: parseInt(week) 
      } 
    });

    if (existingPicks.length > 0) {
      return res.status(400).json({ 
        message: 'El usuario ya tiene picks para esta semana. No se pueden crear picks duplicados.' 
      });
    }

    // Contar cuántas veces se ha usado esta funcionalidad para este usuario
    const adminPickCount = await AdminPick.count({
      where: { 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId)
      }
    });

    if (adminPickCount >= 3) {
      return res.status(400).json({ 
        message: 'Ya se ha utilizado el máximo de 3 veces para este usuario en esta liga.' 
      });
    }

    // Validar que ningún partido ya haya comenzado
    const now = new Date();
    const gameIds = picks.map(p => p.gameId);
    const games = await Game.findAll({
      where: { id: { [Op.in]: gameIds } }
    });

    const startedGames = games.filter(g => new Date(g.date) <= now);
    if (startedGames.length > 0) {
      return res.status(403).json({ 
        message: 'No se pueden hacer picks para partidos que ya han comenzado.',
        startedGames: startedGames.map(g => ({
          id: g.id,
          homeTeam: g.homeTeam,
          awayTeam: g.awayTeam,
          date: g.date
        }))
      });
    }

    // Guardar picks
    for (const p of picks) {
      console.log('Creating admin pick:', { 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId), 
        gameId: p.gameId, 
        pick: p.pick, 
        week: parseInt(week) 
      });
      
      await Pick.create({ 
        userId: parseInt(userId), 
        leagueId: parseInt(leagueId), 
        gameId: p.gameId, 
        pick: p.pick, 
        week: parseInt(week) 
      });
    }

    // Calcular penalización
    const nextPickCount = adminPickCount + 1;
    const penalty = nextPickCount === 1 ? 0 : -3;

    // Registrar el uso de esta funcionalidad
    await AdminPick.create({
      userId: parseInt(userId),
      leagueId: parseInt(leagueId),
      week: parseInt(week),
      adminId: parseInt(adminId),
      pickCount: nextPickCount,
      penaltyApplied: penalty
    });

    console.log('Admin pick record created:', { 
      userId, 
      leagueId, 
      week, 
      adminId, 
      pickCount: nextPickCount, 
      penaltyApplied: penalty 
    });

    // Calcular scores después de guardar picks
    await calculateScores(parseInt(leagueId), parseInt(week));

    const targetUser = await User.findByPk(userId);

    return res.json({ 
      message: 'Picks guardados correctamente por el administrador.',
      targetUser: {
        id: targetUser.id,
        username: targetUser.username
      },
      pickCount: nextPickCount,
      penalty,
      penaltyMessage: penalty === 0 
        ? 'Primera vez: sin penalización' 
        : `${nextPickCount === 2 ? 'Segunda' : 'Tercera'} vez: -3 puntos aplicados`,
      picksCreated: picks.length
    });

  } catch (error) {
    console.error('Error in makePicksForUser:', error);
    return res.status(500).json({ 
      message: 'Error al guardar picks para el usuario.', 
      error: error.message 
    });
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

module.exports = { makePicks, getUserPicks, getLeaguePicks, checkAdminPickEligibility, makePicksForUser };
