module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Posts_Feeds', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      postId: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Posts',
          key: 'id',
        },
      },

      feedId: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'Feeds',
          key: 'id',
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Posts_Feeds');
  },
};
