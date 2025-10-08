const User = require('../models/User');
const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
const InvitationToken = require('../models/InvitationToken');
const Pick = require('../models/Pick');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'El email ya está registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    // Agregar a liga general
    const generalLeague = await League.findOne({ where: { name: 'Liga general', isPublic: true } });
    if (generalLeague) {
      await LeagueMember.create({ userId: user.id, leagueId: generalLeague.id });
    }
    return res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error en el registro.', error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, profileImage: user.profileImage } });
  } catch (error) {
    return res.status(500).json({ message: 'Error en el login.', error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, password, profileImage, favoriteTeam } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar si el username ya existe (solo si está cambiando)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });
      }
    }

    // Preparar los campos a actualizar
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (favoriteTeam !== undefined) updateData.favoriteTeam = favoriteTeam;

    await user.update(updateData);

    return res.json({
      message: 'Perfil actualizado correctamente.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        favoriteTeam: user.favoriteTeam
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el perfil.', error });
  }
};

const wakeup = async (req, res) => {
  try {
    return res.json({ message: 'Backend is awake!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error waking up backend.', error });
  }
};

const checkUserExists = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email es requerido.' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (user) {
      return res.json({
        exists: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      return res.json({
        exists: false
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar usuario.', error });
  }
};

// Validar token de invitación
const validateInvitationToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token es requerido.' });
    }

    const invitation = await InvitationToken.findOne({
      where: { token },
      include: [{ model: League }]
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitación no encontrada.' });
    }

    // Verificar si ya fue usada
    if (invitation.used) {
      return res.status(400).json({ message: 'Esta invitación ya fue utilizada.' });
    }

    // Verificar si expiró
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ message: 'Esta invitación ha expirado.' });
    }

    return res.json({
      valid: true,
      email: invitation.email,
      leagueName: invitation.League.name,
      picksCount: Object.keys(invitation.picksData).reduce((total, week) => {
        return total + invitation.picksData[week].length;
      }, 0)
    });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return res.status(500).json({ message: 'Error al validar token de invitación.', error: error.message });
  }
};

// Registrar usuario con invitación
const registerWithInvitation = async (req, res) => {
  try {
    const { invitationToken, username, password } = req.body;

    if (!invitationToken || !username || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Buscar la invitación
    const invitation = await InvitationToken.findOne({
      where: { token: invitationToken }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitación no encontrada.' });
    }

    // Verificar si ya fue usada
    if (invitation.used) {
      return res.status(400).json({ message: 'Esta invitación ya fue utilizada.' });
    }

    // Verificar si expiró
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ message: 'Esta invitación ha expirado.' });
    }

    // Verificar que el email coincida
    const email = invitation.email;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'El email ya está registrado.' });
    }

    // Crear el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Agregar a liga general
    const generalLeague = await League.findOne({ where: { name: 'Liga general', isPublic: true } });
    if (generalLeague) {
      await LeagueMember.create({ userId: user.id, leagueId: generalLeague.id });
    }

    // Agregar a la liga de la invitación
    await LeagueMember.create({
      userId: user.id,
      leagueId: invitation.leagueId
    });

    // Crear los picks
    for (const [week, weekPicks] of Object.entries(invitation.picksData)) {
      for (const pick of weekPicks) {
        await Pick.create({
          userId: user.id,
          leagueId: invitation.leagueId,
          gameId: pick.gameId,
          week: parseInt(week),
          pick: pick.pick
        });
      }
    }

    // Marcar la invitación como usada
    await invitation.update({ used: true });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente con invitación.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Error registering with invitation:', error);
    return res.status(500).json({ message: 'Error en el registro con invitación.', error: error.message });
  }
};

module.exports = { register, login, updateProfile, wakeup, checkUserExists, validateInvitationToken, registerWithInvitation };
