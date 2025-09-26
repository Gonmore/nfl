const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const League = sequelize.define('League', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  adminId: { type: DataTypes.INTEGER, allowNull: false },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  inviteCode: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

module.exports = League;
