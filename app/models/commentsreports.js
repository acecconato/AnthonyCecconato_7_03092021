const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentsReports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Comments, Users }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(Comments, { foreignKey: 'commentId', as: 'comment' });
    }
  }
  CommentsReports.init({
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    commentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  }, {
    sequelize,
    modelName: 'CommentsReports',
  });
  return CommentsReports;
};
