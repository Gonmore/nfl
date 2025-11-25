const { sequelize, User, League, LeagueMember, Game, Pick, Score, InvitationToken, AdminPick } = require('../models');
const { QueryTypes } = require('sequelize');

// Middleware para verificar que el usuario es admin global
const isGlobalAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    // Verificar si el usuario es admin (puedes personalizar esta lógica)
    // Por ahora, el usuario con ID 1 o username 'admin' es considerado admin global
    if (user && (user.id === 1 || user.username === 'admin')) {
      next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores globales.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar permisos.', error: error.message });
  }
};

// Obtener lista de todas las tablas
const getTables = async (req, res) => {
  try {
    const tables = {
      users: { name: 'Usuarios', model: 'User' },
      leagues: { name: 'Ligas', model: 'League' },
      leagueMembers: { name: 'Miembros de Liga', model: 'LeagueMember' },
      games: { name: 'Partidos', model: 'Game' },
      picks: { name: 'Picks', model: 'Pick' },
      scores: { name: 'Puntuaciones', model: 'Score' },
      invitationTokens: { name: 'Tokens de Invitación', model: 'InvitationToken' },
      adminPicks: { name: 'Picks de Admin', model: 'AdminPick' }
    };

    res.json({ tables });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tablas.', error: error.message });
  }
};

// Obtener registros de una tabla con paginación
const getTableData = async (req, res) => {
  try {
    const { table } = req.params;
    const { page = 1, limit = 50, orderBy = 'id', order = 'ASC', userId, week } = req.query;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const offset = (page - 1) * limit;
    
    // Construir filtros adicionales para picks
    const where = {};
    if (table === 'picks') {
      if (userId) where.userId = parseInt(userId);
      if (week) where.week = parseInt(week);
    }

    const { count, rows } = await model.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[orderBy, order]]
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos.', error: error.message });
  }
};

// Obtener un registro específico
const getRecord = async (req, res) => {
  try {
    const { table, id } = req.params;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const record = await model.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }

    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registro.', error: error.message });
  }
};

// Crear un nuevo registro
const createRecord = async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const record = await model.create(data);
    res.status(201).json({ message: 'Registro creado exitosamente.', record });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear registro.', error: error.message });
  }
};

// Actualizar un registro
const updateRecord = async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const record = await model.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }

    await record.update(data);
    res.json({ message: 'Registro actualizado exitosamente.', record });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar registro.', error: error.message });
  }
};

// Eliminar un registro
const deleteRecord = async (req, res) => {
  try {
    const { table, id } = req.params;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const record = await model.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }

    await record.destroy();
    res.json({ message: 'Registro eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar registro.', error: error.message });
  }
};

// Ejecutar consulta SQL personalizada (solo lectura por seguridad)
const executeQuery = async (req, res) => {
  try {
    const { query } = req.body;

    // Solo permitir consultas SELECT por seguridad
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(403).json({ 
        message: 'Solo se permiten consultas SELECT por seguridad. Use los endpoints CRUD para modificar datos.' 
      });
    }

    const results = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al ejecutar consulta.', error: error.message });
  }
};

// Obtener estadísticas generales de la base de datos
const getDatabaseStats = async (req, res) => {
  try {
    const stats = {
      users: await User.count(),
      leagues: await League.count(),
      leagueMembers: await LeagueMember.count(),
      games: await Game.count(),
      picks: await Pick.count(),
      scores: await Score.count(),
      invitationTokens: await InvitationToken.count(),
      adminPicks: await AdminPick.count()
    };

    // Estadísticas adicionales
    const activeLeagues = await League.count({ where: { isPublic: false } });
    const publicLeagues = await League.count({ where: { isPublic: true } });
    const finishedGames = await Game.count({ where: { status: 'STATUS_FINAL' } });
    const pendingGames = await Game.count({ where: { status: { [sequelize.Sequelize.Op.ne]: 'STATUS_FINAL' } } });

    res.json({
      totalRecords: stats,
      additionalStats: {
        activeLeagues,
        publicLeagues,
        finishedGames,
        pendingGames
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
  }
};

// Obtener esquema de una tabla
const getTableSchema = async (req, res) => {
  try {
    const { table } = req.params;

    const models = {
      users: User,
      leagues: League,
      leagueMembers: LeagueMember,
      games: Game,
      picks: Pick,
      scores: Score,
      invitationTokens: InvitationToken,
      adminPicks: AdminPick
    };

    const model = models[table];
    if (!model) {
      return res.status(404).json({ message: 'Tabla no encontrada.' });
    }

    const attributes = model.rawAttributes;
    const schema = Object.keys(attributes).map(key => ({
      field: key,
      type: attributes[key].type.toString(),
      allowNull: attributes[key].allowNull,
      defaultValue: attributes[key].defaultValue,
      primaryKey: attributes[key].primaryKey || false,
      autoIncrement: attributes[key].autoIncrement || false
    }));

    res.json({ table, schema });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener esquema.', error: error.message });
  }
};

module.exports = {
  isGlobalAdmin,
  getTables,
  getTableData,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  executeQuery,
  getDatabaseStats,
  getTableSchema
};
