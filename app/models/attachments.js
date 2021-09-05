const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attachments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Posts }) {
      // define association here
      this.belongsTo(Posts, { foreignKey: 'postId', as: 'post' });
    }

    toJSON() {
      return { ...this.get(), id: undefined, postId: undefined };
    }
  }
  Attachments.init({
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

    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [0, 255],
      },
    },

    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [0, 255],
      },
    },

    alt: {
      type: DataTypes.STRING(255),
      validate: {
        len: [0, 255],
      },
    },

    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      validate: {
        isInt: true,
      },
    },

  }, {
    sequelize,
    modelName: 'Attachments',
  });
  return Attachments;
};
