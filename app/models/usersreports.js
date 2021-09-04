const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsersReports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'fromUserId', as: 'reportedUsers' });
      this.belongsTo(Users, { foreignKey: 'reportedUserId', as: 'reports' });
    }
  }
  UsersReports.init({
    reportedUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    fromUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  }, {
    sequelize,
    modelName: 'UsersReports',
  });
  return UsersReports;
};
