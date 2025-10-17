const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AdminPicks', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Leagues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      week: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pickCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número de veces que se ha usado esta funcionalidad (1, 2 o 3)'
      },
      penaltyApplied: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Penalización aplicada (-3 para 2da y 3ra vez, 0 para 1ra vez)'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('AdminPicks', ['userId', 'leagueId'], {
      name: 'admin_picks_user_league_idx'
    });

    await queryInterface.addIndex('AdminPicks', ['userId', 'leagueId', 'week'], {
      name: 'admin_picks_unique_idx',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AdminPicks');
  }
};
