const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Posts, Comments, PostsReports, Votes, UsersReports, CommentsReports,
    }) {
      // define association here
      this.hasMany(Posts, { foreignKey: 'userId', as: 'posts', onDelete: 'set null' });
      this.hasMany(Comments, { foreignKey: 'userId', as: 'comments', onDelete: 'set null' });
      this.hasMany(PostsReports, { foreignKey: 'userId', as: 'reportedPosts', onDelete: 'cascade' });
      this.hasMany(Votes, { foreignKey: 'userId', as: 'votes', onDelete: 'cascade' });
      this.hasMany(UsersReports, { foreignKey: 'fromUserId', as: 'reportedUsers', onDelete: 'cascade' });
      this.hasMany(UsersReports, { foreignKey: 'reportedUserId', as: 'reports', onDelete: 'cascade' });
      this.hasMany(CommentsReports, { foreignKey: 'userId', as: 'reportedComments', onDelete: 'cascade' });
    }

    toJSON() {
      return { ...this.get(), id: undefined, password: undefined };
    }
  }
  Users.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },

    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: {
        notNull: true,
        notEmpty: true,
        isEmail: true,
        len: [0, 60],
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        isStrongPassword: { args: false },
        // TODO: HIBP
      },
    },

    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [0, 30],
      },
    },

    role: {
      type: DataTypes.ENUM(['user', 'admin']),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        notNull: true,
        notEmpty: true,
        len: [0, 30],
      },
    },

    firstName: {
      type: DataTypes.STRING(30),
      validate: {
        len: [0, 30],
        is: {
          args: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/i,
          msg: 'The specified first name is not in a valid format',
        },
      },
    },

    lastName: {
      type: DataTypes.STRING(30),
      validate: {
        len: [0, 30],
        is: {
          args: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/i,
          msg: 'The specified last name is not in a valid format',
        },
      },
    },

    birthdate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
      },
    },

  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};
