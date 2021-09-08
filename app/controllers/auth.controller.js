const jwt = require('jsonwebtoken');
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

    const accessToken = jwt.sign({ uuid: user.uuid, role: user.role }, process.env.SECRET, { expiresIn });
    const refreshToken = await RefreshTokens.createToken(user);

    return res.json({
      userId: user.id,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
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
    console.error(e);
    return res.status(500).json(e);
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
    const newAccessToken = jwt.sign({ uuid: user.uuid, role: user.role }, process.env.SECRET, { expiresIn });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};
