const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users, Posts, CommentsReports }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(Posts, { foreignKey: 'postId', as: 'post' });
      this.hasMany(CommentsReports, { foreignKey: 'commentId', as: 'reports' });
    }
  }
  Comments.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    content: {
      type: DataTypes.STRING(160),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [0, 160],
      },
    },

    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
    },
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};
