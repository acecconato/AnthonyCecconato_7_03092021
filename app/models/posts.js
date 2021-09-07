const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Users, Comments, Attachments, PostsReports, Votes,
    }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
      this.hasMany(Comments, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
      this.hasOne(Attachments, { foreignKey: 'postId', as: 'attachment', onDelete: 'CASCADE' });
      this.hasMany(PostsReports, { foreignKey: 'postId', as: 'reports', onDelete: 'CASCADE' });
      this.hasMany(Votes, { foreignKey: 'postId', as: 'votes', onDelete: 'cascade' });
    }

    toJSON() {
      return { ...this.get(), id: undefined, userId: undefined };
    }
  }
  Posts.init({
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [20, 400],
      },
    },

  }, {
    sequelize,
    modelName: 'Posts',
  });
  return Posts;
};
