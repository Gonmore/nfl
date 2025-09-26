const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Game = sequelize.define('Game', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  espnId: { type: DataTypes.STRING, unique: true },
  homeTeam: { type: DataTypes.STRING, allowNull: false },
  awayTeam: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  week: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  winner: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

module.exports = Game;
