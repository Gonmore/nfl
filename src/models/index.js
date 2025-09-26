const sequelize = require('./db');

// Importar modelos
const User = require('./User');
const League = require('./League');
const LeagueMember = require('./LeagueMember');
const Game = require('./Game');
const Pick = require('./Pick');
const Score = require('./Score');

// Definir asociaciones
User.hasMany(LeagueMember, { foreignKey: 'userId' });
LeagueMember.belongsTo(User, { foreignKey: 'userId' });

League.hasMany(LeagueMember, { foreignKey: 'leagueId' });
LeagueMember.belongsTo(League, { foreignKey: 'leagueId' });

League.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });

Game.hasMany(Pick, { foreignKey: 'gameId' });
Pick.belongsTo(Game, { foreignKey: 'gameId' });

User.hasMany(Pick, { foreignKey: 'userId' });
Pick.belongsTo(User, { foreignKey: 'userId' });

League.hasMany(Pick, { foreignKey: 'leagueId' });
Pick.belongsTo(League, { foreignKey: 'leagueId' });

User.hasMany(Score, { foreignKey: 'userId' });
Score.belongsTo(User, { foreignKey: 'userId' });

League.hasMany(Score, { foreignKey: 'leagueId' });
Score.belongsTo(League, { foreignKey: 'leagueId' });

module.exports = { sequelize, User, League, LeagueMember, Game, Pick, Score };
