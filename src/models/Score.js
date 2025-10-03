const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Score = sequelize.define('Score', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  week: { type: DataTypes.INTEGER, allowNull: false },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'leagueId', 'week']
    }
  ]
});

module.exports = Score;
