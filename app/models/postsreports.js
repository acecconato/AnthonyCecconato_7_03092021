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
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  }, {
    sequelize,
    modelName: 'PostsReports',
  });
  return PostsReports;
};
