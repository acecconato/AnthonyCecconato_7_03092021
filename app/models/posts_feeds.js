const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Posts_Feeds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Posts_Feeds.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },

    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id',
      },
    },

    feedId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Feeds',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Posts_Feeds',
    timestamps: false,
  });

  return Posts_Feeds;
};
