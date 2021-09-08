const jwt = require('jsonwebtoken');

const cache = require('../services/cache');
const errorHandler = require('../services/errorHandler');
const { Users, RefreshTokens } = require('../models');

/**
 * Login then create a json web token
 * The token can be passed through the Authorization: Bearer header to authenticate a user
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.login = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { username: req.body.username } });

    if (!user || !await user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Bad Credentials' });
    }

    const expiresIn = parseInt(process.env.JWT_EXP);

    const accessToken = jwt.sign({ uuid: user.id, role: user.role }, process.env.SECRET, { expiresIn });
    const refreshToken = await RefreshTokens.createToken(user);

    /* Used for revoke access:
    * We store the current access and refresh tokens, so we can check their validity in our authentication middleware */
    cache.putSync(`jwt${user.id}`, { accessToken, refreshToken, isRevoked: false });

    return res.json({
      userId: user.id,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Create a user account
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.signup = async (req, res) => {
  try {
    const user = await Users.create(req.body, {
      fields: [
        'email',
        'password',
        'username',
        'firstName',
        'lastName',
        'birthdate',
      ],
    });

    return res.status(201).json({
      ...user.dataValues, password: undefined, createdAt: undefined, updatedAt: undefined,
    });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Refresh a token
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.refreshToken = async (req, res, next) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken === null) {
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  try {
    const refreshToken = await RefreshTokens.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      return res.status(403).json({ message: 'The refresh token is not registered' });
    }

    if (await refreshToken.isExpired()) {
      refreshToken.destroy();
      return res.status(403).json({ message: 'Refresh token is expired. You need to login again' });
    }

    const expiresIn = parseInt(process.env.JWT_EXP);

    const user = await refreshToken.getUser();
    const newAccessToken = jwt.sign({ uuid: user.id, role: user.role }, process.env.SECRET, { expiresIn });

    const cachedToken = cache.getSync(`jwt${user.id}`);
    if (cachedToken && cachedToken.isRevoked && cachedToken.isRevoked === true) {
      return res.status(403).json({ message: 'The token is revoked' });
    }

    cache.putSync(`jwt${user.id}`, { accessToken: newAccessToken, refreshToken: refreshToken.token, isRevoked: false });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (e) {
    errorHandler(e, res);
  }
};
