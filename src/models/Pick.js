const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Pick = sequelize.define('Pick', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  gameId: { type: DataTypes.INTEGER, allowNull: false },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  pick: { type: DataTypes.STRING, allowNull: false },
  week: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'gameId', 'leagueId']
    }
  ]
});

module.exports = Pick;
