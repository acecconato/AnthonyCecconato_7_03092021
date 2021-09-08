const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostsReports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users, Posts }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(Posts, { foreignKey: 'postId', as: 'post' });
    }
  }

  PostsReports.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'PostsReports',
    timestamps: false,
  });

  return PostsReports;
};
