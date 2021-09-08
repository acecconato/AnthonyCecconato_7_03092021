module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RefreshTokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      expiryDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      token: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RefreshTokens');
  },
};
