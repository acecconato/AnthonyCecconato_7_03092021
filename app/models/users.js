const { Model } = require('sequelize');
const argon2 = require('argon2');

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

    // toJSON() {
    //   return { ...this.get(), password: undefined };
    // }

    async comparePassword(plainPassword) {
      return argon2.verify(this.password, plainPassword);
    }
  }

  Users.init({
    // todo mettre id ici finir jwt
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
        isIn: {
          args: [['user', 'admin']],
          msg: 'Invalid role provided. Should be user or admin',
        },
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

  const hashPassword = async (user) => {
    if (user.changed('password')) {
      const hash = await argon2.hash(user.password);
      user.setDataValue('password', hash);
    }
  };

  Users.beforeCreate(hashPassword);
  Users.beforeUpdate(hashPassword);

  return Users;
};
