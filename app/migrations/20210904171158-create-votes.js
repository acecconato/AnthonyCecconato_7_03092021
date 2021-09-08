module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Votes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
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

      postId: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Posts',
          key: 'id',
        },
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Votes');
  },
};
