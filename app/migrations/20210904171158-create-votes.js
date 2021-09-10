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

      vote: {
        type: Sequelize.ENUM(['-1', '0', '1']),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Votes');
  },
};
