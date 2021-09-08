module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      userId: {
        type: Sequelize.UUID,
        onDelete: 'SET NULL',
        references: {
          model: 'Users',
          key: 'id',
        },
      },

      postId: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        allowNull: false,
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
    await queryInterface.dropTable('Comments');
  },
};
