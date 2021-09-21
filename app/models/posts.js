const { Model } = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Users, Comments, PostsReports, Likes, Feeds, Posts_Feeds,
    }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
      this.hasMany(Comments, { foreignKey: 'postId', as: 'comments', onDelete: 'cascade' });
      this.hasMany(PostsReports, { foreignKey: 'postId', as: 'reports', onDelete: 'cascade' });
      this.hasMany(Likes, { foreignKey: 'postId', as: 'likes', onDelete: 'cascade' });
      this.belongsToMany(Feeds, { through: Posts_Feeds, foreignKey: 'postId', as: 'feeds' });
    }
  }

  Posts.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      trim: true,
      validate: {
        notNull: {
          args: true,
          msg: 'The content cannot be null',
        },
        notEmpty: {
          args: true,
          msg: 'The content is empty',
        },
        len: {
          args: [20, 400],
          msg: 'Username must have 20 to 400 characters',
        },
      },
    },

    media: {
      type: DataTypes.TEXT,
      allowNull: true,
      // TODO VALIDATION NE FONCTIONNE PAS -> BUG SEQUELIZE -> PAS POSSIBLE DE METTRE Empty ou isUrl
    },

  }, {
    sequelize,
    modelName: 'Posts',
  });

  sequelizeTransforms(Posts);

  return Posts;
};
