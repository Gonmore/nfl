const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const InvitationToken = sequelize.define('InvitationToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'leagues',
      key: 'id'
    }
  },
  picksData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'invitation_tokens',
  timestamps: true
});

module.exports = InvitationToken;
