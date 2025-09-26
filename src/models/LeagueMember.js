const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const LeagueMember = sequelize.define('LeagueMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
});

module.exports = LeagueMember;
