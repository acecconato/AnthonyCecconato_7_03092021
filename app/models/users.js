const { Model } = require('sequelize');
const argon2 = require('argon2');
const sequelizeTransforms = require('sequelize-transforms');

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
        msg: 'L\'adresse mail est déjà enregistrée',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'L\'adresse mail est vide',
        },
        notEmpty: {
          args: true,
          msg: 'L\'adresse mail est vide',
        },
        isEmail: {
          args: true,
          msg: 'L\'adresse mail n\'est pas correct',
        },
        len: {
          args: [5, 60],
          msg: 'L\'adresse mail doit comporter entre 5 et 60 caractères',
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Le mot de passe est vide',
        },
        notEmpty: {
          args: true,
          msg: 'Le mot de passe est vide',
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
        msg: 'Le nom d\'utilisateur est déjà pris',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'Le nom d\'utilisateur est vide',
        },
        notEmpty: {
          args: true,
          msg: 'Le nom d\'utilisateur est vide',
        },
        len: {
          args: [3, 30],
          msg: 'Le nom d\'utilisateur doit comporter entre 3 et 30 caractères',
        },
        is: {
          args: /^[a-z0-9]+$/i,
          msg: 'Le nom d\'utilisateur ne peut contenir que des chiffres et des lettres',
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
          msg: 'Le role est vide',
        },
        notEmpty: {
          args: true,
          msg: 'Le role est vide',
        },
        len: {
          args: [3, 30],
          msg: 'Le role doit comporter entre 3 et 30 caractères',
        },
        isIn: {
          args: [['user', 'admin']],
          msg: 'Mauvais role, peut seulement être "user" ou "admin"',
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

      async beforeBulkCreate(user) {
        const hash = await argon2.hash(user.password);
        user.setDataValue('password', hash);
      },
    },
  });

  sequelizeTransforms(Users);

  return Users;
};
