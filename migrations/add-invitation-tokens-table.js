const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invitation_tokens', {
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
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Añadir índice para búsqueda por token
    await queryInterface.addIndex('invitation_tokens', ['token']);
    
    // Añadir índice para búsqueda por email
    await queryInterface.addIndex('invitation_tokens', ['email']);
    
    // Añadir índice para búsqueda por leagueId
    await queryInterface.addIndex('invitation_tokens', ['leagueId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('invitation_tokens');
  }
};
