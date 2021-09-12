const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feeds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Posts, Users, Posts_Feeds }) {
      this.belongsToMany(Posts, { through: Posts_Feeds, foreignKey: 'feedId' });
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
    }
  }

  Feeds.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Feeds',
    timestamps: false,
  });

  return Feeds;
};
