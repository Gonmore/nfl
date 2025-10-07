const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
const User = require('../models/User');
const Pick = require('../models/Pick');
const Game = require('../models/Game');
const InvitationToken = require('../models/InvitationToken');
const crypto = require('crypto');

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

// Agregar usuario con picks pasados (solo para admin de liga)
const addUserWithPicks = async (req, res) => {
  try {
    const { email, leagueId, picks } = req.body;
    const adminId = req.user.id;

    if (!email || !leagueId || !picks) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar que la liga existe y el usuario es admin
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'Liga no encontrada.' });
    }

    if (league.adminId !== adminId) {
      return res.status(403).json({ message: 'Solo el administrador de la liga puede agregar usuarios.' });
    }

    // Verificar que el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado con ese email.' });
    }

    // Verificar que el usuario no está ya en la liga
    const exists = await LeagueMember.findOne({
      where: { userId: user.id, leagueId }
    });
    if (exists) {
      return res.status(409).json({ message: 'El usuario ya es miembro de esta liga.' });
    }

    // Agregar usuario a la liga
    await LeagueMember.create({ userId: user.id, leagueId });

    // Agregar los picks para cada semana
    for (const [week, weekPicks] of Object.entries(picks)) {
      for (const pick of weekPicks) {
        // Verificar que el juego existe
        const game = await Game.findByPk(pick.gameId);
        if (!game) {
          console.warn(`Game ${pick.gameId} not found for week ${week}`);
          continue;
        }

        // Crear el pick
        await Pick.create({
          userId: user.id,
          leagueId,
          gameId: pick.gameId,
          week: parseInt(week),
          pick: pick.pick
        });
      }
    }

    return res.status(201).json({
      message: 'Usuario agregado exitosamente con sus picks pasados.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error adding user with picks:', error);
    return res.status(500).json({ message: 'Error al agregar usuario con picks.', error: error.message });
  }
};

// Crear invitación con picks (solo para admin de liga)
const createInvitationWithPicks = async (req, res) => {
  try {
    const { email, leagueId, picks } = req.body;
    const adminId = req.user.id;

    if (!email || !leagueId || !picks) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    // Verificar que la liga existe y el usuario es admin
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'Liga no encontrada.' });
    }

    if (league.adminId !== adminId) {
      return res.status(403).json({ message: 'Solo el administrador de la liga puede crear invitaciones.' });
    }

    // Verificar que el email no está ya registrado y es miembro de la liga
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const exists = await LeagueMember.findOne({
        where: { userId: existingUser.id, leagueId }
      });
      if (exists) {
        return res.status(409).json({ message: 'Este usuario ya es miembro de esta liga.' });
      }
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crear la invitación
    const invitation = await InvitationToken.create({
      token,
      email,
      leagueId,
      picksData: picks,
      expiresAt,
      used: false
    });

    return res.status(201).json({
      message: 'Invitación creada exitosamente.',
      token: invitation.token,
      email: invitation.email,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    console.error('Error creating invitation with picks:', error);
    return res.status(500).json({ message: 'Error al crear invitación.', error: error.message });
  }
};

module.exports = { createLeague, joinLeague, getLeagueMembers, getUserLeagues, joinGeneralLeague, addUserWithPicks, createInvitationWithPicks };
