const { Model } = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');

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
      trim: true,
      validate: {
        notNull: {
          args: true,
          msg: 'Le contenu est vide',
        },
        notEmpty: {
          args: true,
          msg: 'Le contenu est vide',
        },
        len: {
          args: [5, 160],
          msg: 'Le contenu doit comporter entre 5 et 160 caractères',
        },
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

  sequelizeTransforms(Comments);

  return Comments;
};
