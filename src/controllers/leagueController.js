const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
const User = require('../models/User');

// Función para generar código único de 8 caracteres
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Crear liga
const createLeague = async (req, res) => {
  try {
    const { name, isPublic, description } = req.body;
    const adminId = req.user.id;

    if (!name) return res.status(400).json({ message: 'El nombre de la liga es obligatorio.' });

    // Generar código único
    let inviteCode;
    let attempts = 0;
    do {
      inviteCode = generateInviteCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ message: 'Error al generar código único.' });
      }
    } while (await League.findOne({ where: { inviteCode } }));

    const league = await League.create({
      name,
      adminId,
      isPublic: isPublic || false,
      inviteCode,
      description
    });

    await LeagueMember.create({ userId: adminId, leagueId: league.id });
    return res.status(201).json({
      message: 'Liga creada correctamente.',
      league: {
        ...league.toJSON(),
        inviteCode // Incluir el código en la respuesta para mostrarlo al usuario
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la liga.', error });
  }
};

// Unirse a liga
const joinLeague = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    let league;
    if (inviteCode) {
      // Buscar por código de invitación
      league = await League.findOne({ where: { inviteCode } });
      if (!league) return res.status(404).json({ message: 'Liga no encontrada o código inválido.' });
    } else {
      // Si no hay código, solo permitir unirse a ligas públicas
      // Esto es para compatibilidad con el sistema anterior
      return res.status(400).json({ message: 'Código de invitación requerido.' });
    }

    const exists = await LeagueMember.findOne({ where: { userId, leagueId: league.id } });
    if (exists) return res.status(409).json({ message: 'Ya eres miembro de esta liga.' });

    await LeagueMember.create({ userId, leagueId: league.id });
    return res.json({
      message: 'Unido a la liga correctamente.',
      league: { id: league.id, name: league.name }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al unirse a la liga.', error });
  }
};

// Ver miembros de liga
const getLeagueMembers = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const members = await LeagueMember.findAll({ where: { leagueId }, include: User });
    return res.json({ members });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener miembros.', error });
  }
};

// Ver ligas del usuario
const getUserLeagues = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await LeagueMember.findAll({ where: { userId }, include: League });
    const leagues = memberships.map(m => ({
      ...m.League.toJSON(),
      isAdmin: m.League.adminId === userId // Indicar si el usuario es admin
    }));
    return res.json({ leagues });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ligas.', error });
  }
};

// Unirse a liga general (pública)
const joinGeneralLeague = async (req, res) => {
  try {
    const userId = req.user.id;

    const league = await League.findOne({ where: { name: 'Liga general', isPublic: true } });
    if (!league) return res.status(404).json({ message: 'Liga general no encontrada.' });

    const exists = await LeagueMember.findOne({ where: { userId, leagueId: league.id } });
    if (exists) return res.status(409).json({ message: 'Ya eres miembro de la Liga General.' });

    await LeagueMember.create({ userId, leagueId: league.id });
    return res.json({
      message: 'Unido a la Liga General correctamente.',
      league: { id: league.id, name: league.name }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al unirse a la Liga General.', error });
  }
};

module.exports = { createLeague, joinLeague, getLeagueMembers, getUserLeagues, joinGeneralLeague };
