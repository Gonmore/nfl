require('dotenv').config();
const { sequelize } = require('./src/models');

async function addColumns() {
  try {
    await sequelize.getQueryInterface().addColumn('Leagues', 'isPublic', {
      type: require('sequelize').DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    console.log('Added isPublic column');

    await sequelize.getQueryInterface().addColumn('Leagues', 'inviteCode', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
    });
    console.log('Added inviteCode column');

    await sequelize.getQueryInterface().addColumn('Leagues', 'description', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
    });
    console.log('Added description column');

    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();