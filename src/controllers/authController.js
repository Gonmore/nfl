const User = require('../models/User');
const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
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
    const { username, password, profileImage } = req.body;
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

    await user.update(updateData);

    return res.json({
      message: 'Perfil actualizado correctamente.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el perfil.', error });
  }
};

module.exports = { register, login, updateProfile };
