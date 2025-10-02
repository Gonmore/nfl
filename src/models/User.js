const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  profileImage: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

module.exports = User;
