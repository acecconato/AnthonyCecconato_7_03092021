const {
  Model,
} = require('sequelize');

const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class RefreshTokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      this.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
    }

    /**
     * Verify refresh token expiration
     * @return {Promise<boolean>}
     */
    async isExpired() {
      return this.expiryDate.getTime() < new Date().getTime();
    }
  }

  RefreshTokens.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    expiryDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
      },
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    timestamps: false,
    modelName: 'RefreshTokens',
  });

  /**
   * Create a refresh token
   * @param user
   * @return {Promise<*>}
   */
  RefreshTokens.createToken = async function (user) {
    if (!user.id) {
      throw new Error('User id is null');
    }

    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + parseInt(process.env.JWT_REFRESH_EXP));

    const refreshToken = await this.create({
      token: uuidv4(),
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    });

    return refreshToken.token;
  };

  return RefreshTokens;
};
