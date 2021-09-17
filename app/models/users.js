const { Model } = require('sequelize');
const argon2 = require('argon2');

const { isPasswordInDataBreaches, isStrongPassword } = require('../services/validator');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Posts, Comments, PostsReports, Likes, CommentsReports, RefreshTokens, Feeds,
    }) {
      // define association here
      this.hasMany(Posts, { foreignKey: 'userId', as: 'posts', onDelete: 'set null' });
      this.hasMany(Comments, { foreignKey: 'userId', as: 'comments', onDelete: 'set null' });
      this.hasMany(PostsReports, { foreignKey: 'userId', as: 'reportedPosts', onDelete: 'cascade' });
      this.hasMany(Likes, { foreignKey: 'userId', as: 'likes', onDelete: 'cascade' });
      this.hasMany(CommentsReports, { foreignKey: 'userId', as: 'reportedComments', onDelete: 'cascade' });
      this.hasMany(RefreshTokens, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'cascade' });
      this.hasOne(Feeds, { foreignKey: 'userId', as: 'feed', onDelete: 'cascade' });
    }

    toJSON() {
      return { ...this.get(), password: undefined };
    }

    async comparePassword(plainPassword) {
      return argon2.verify(this.password, plainPassword);
    }
  }

  Users.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    email: {
      type: DataTypes.STRING(60),
      lowercase: true,
      trim: true,
      allowNull: false,
      unique: {
        args: true,
        msg: 'The email address is already registered',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'The email address cannot be null',
        },
        notEmpty: {
          args: true,
          msg: 'The email address is empty',
        },
        isEmail: {
          args: true,
          msg: 'The email address syntax is incorrect',
        },
        len: {
          args: [5, 60],
          msg: 'Email address must have 5 to 60 characters',
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'The password cannot be null',
        },
        notEmpty: {
          args: true,
          msg: 'The password is empty',
        },
        isPasswordInDataBreaches,
        isStrongPassword,
      },
    },

    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      trim: true,
      unique: {
        args: true,
        msg: 'The username is already taken',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'The username cannot be null',
        },
        notEmpty: {
          args: true,
          msg: 'The username is empty',
        },
        len: {
          args: [3, 30],
          msg: 'Username must have 3 to 30 characters',
        },
        is: {
          args: /^[a-z0-9]+$/i,
          msg: 'Username syntax is not valid. Only accept alphanumerical characters',
        },
      },
    },

    role: {
      type: DataTypes.ENUM(['user', 'admin']),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        notNull: {
          args: true,
          msg: 'The role cannot be null',
        },
        notEmpty: {
          args: true,
          msg: 'The role is empty',
        },
        len: {
          args: [3, 30],
          msg: 'Role must have 3 to 30 characters',
        },
        isIn: {
          args: [['user', 'admin']],
          msg: 'Invalid role provided. Must be user or admin',
        },
      },
    },

  }, {
    sequelize,
    modelName: 'Users',
    hooks: {
      async beforeCreate(user) {
        if (user.changed('password')) {
          const hash = await argon2.hash(user.password);
          user.setDataValue('password', hash);
        }
      },

      async beforeUpdate(user) {
        if (user.changed('password')) {
          const hash = await argon2.hash(user.password);
          user.setDataValue('password', hash);
        }
      },
    },
  });

  return Users;
};
