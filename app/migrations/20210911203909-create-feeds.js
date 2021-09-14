module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Feeds', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      userId: {
        unique: true,
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: 'cascade',
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Feeds');
  },
};
