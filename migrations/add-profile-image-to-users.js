'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'profileImage', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'profileImage');
  }
};