const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const AdminPick = sequelize.define('AdminPick', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // Usuario por el que se hicieron los picks
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  week: { type: DataTypes.INTEGER, allowNull: false },
  adminId: { type: DataTypes.INTEGER, allowNull: false }, // Admin que hizo los picks
  pickCount: { type: DataTypes.INTEGER, allowNull: false }, // Cuántas veces se ha usado (1, 2 o 3)
  penaltyApplied: { type: DataTypes.INTEGER, defaultValue: 0 }, // Penalización aplicada (-3 para 2da y 3ra vez)
}, {
  timestamps: true,
  indexes: [
    {
      // Índice para búsquedas rápidas por usuario y liga
      fields: ['userId', 'leagueId']
    },
    {
      // Índice único para evitar duplicados en la misma semana
      unique: true,
      fields: ['userId', 'leagueId', 'week']
    }
  ]
});

module.exports = AdminPick;
