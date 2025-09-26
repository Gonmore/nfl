const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
const User = require('../models/User');

// Crear liga
const createLeague = async (req, res) => {
  try {
    const { name, isPublic, inviteCode, description } = req.body;
    const adminId = req.user.id;
    if (!name) return res.status(400).json({ message: 'El nombre de la liga es obligatorio.' });
    const league = await League.create({ name, adminId, isPublic: isPublic || false, inviteCode, description });
    await LeagueMember.create({ userId: adminId, leagueId: league.id });
    return res.status(201).json({ message: 'Liga creada correctamente.', league });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la liga.', error });
  }
};

// Unirse a liga
const joinLeague = async (req, res) => {
  try {
    const { leagueId, inviteCode } = req.body;
    const userId = req.user.id;
    const league = await League.findByPk(leagueId);
    if (!league) return res.status(404).json({ message: 'Liga no encontrada.' });
    if (!league.isPublic && league.inviteCode !== inviteCode) {
      return res.status(403).json({ message: 'Código de invitación incorrecto.' });
    }
    const exists = await LeagueMember.findOne({ where: { userId, leagueId } });
    if (exists) return res.status(409).json({ message: 'Ya eres miembro de esta liga.' });
    await LeagueMember.create({ userId, leagueId });
    return res.json({ message: 'Unido a la liga correctamente.' });
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
    const leagues = memberships.map(m => m.League);
    return res.json({ leagues });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ligas.', error });
  }
};

module.exports = { createLeague, joinLeague, getLeagueMembers, getUserLeagues };
