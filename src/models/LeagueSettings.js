const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const LeagueSettings = sequelize.define('LeagueSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  thursdayPoints: { type: DataTypes.INTEGER, defaultValue: 1 },
  sundayPoints: { type: DataTypes.INTEGER, defaultValue: 2 },
  mondayPoints: { type: DataTypes.INTEGER, defaultValue: 3 },
}, {
  timestamps: true,
});

module.exports = LeagueSettings;
