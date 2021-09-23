const jwt = require('jsonwebtoken');

const cache = require('../services/cache');
const errorHandler = require('../services/errorHandler');
const { Users, RefreshTokens } = require('../models');
const { revokeAccess } = require('../middlewares/authenticate.middleware');

/**
 * Login then create an access token and a refresh token
 * The access token can be passed through the Authorization: Bearer header to authenticate a user
 * The refresh token can be used with the /refresh-token route
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.login = async (req, res) => {
  const { remember } = req.body || false;

  try {
    const user = await Users.findOne({
      where: { username: req.body.username },
      include: ['feed'],
    });

    if (!user || !await user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const expiresIn = parseInt(process.env.JWT_EXP);

    const accessToken = jwt.sign({ uuid: user.id, role: user.role }, process.env.SECRET, { expiresIn });
    const refreshToken = (remember) ? await RefreshTokens.createToken(user) : undefined;

    /* Used for revoke access:
    * We store the current access and refresh tokens, so we can check their validity in our authentication middleware */
    cache.setItem(`jwt${user.id}`, JSON.stringify({ accessToken, refreshToken, isRevoked: false }));

    return res.json({
      userId: user.id,
      accessToken,
      refreshToken,
      role: user.role,
      username: user.username,
      email: user.email,
      feed: user.feed,
    });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Logout
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.logout = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    await revokeAccess(user);
    await RefreshTokens.destroy({ where: { userId: user.id } });

    return res.status(204).send();
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
      fields: ['email', 'password', 'username'],
    });

    await user.createFeed();

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
    return res.status(403).json({ message: 'Le refresh token est expiré' });
  }

  try {
    const refreshToken = await RefreshTokens.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      return res.status(403).json({ message: 'Le refresh token n\'est pas enregistré' });
    }

    if (await refreshToken.isExpired()) {
      refreshToken.destroy();
      return res.status(403).json({ message: 'Le refresh token est expiré, vous devez vous reconnecter' });
    }

    const expiresIn = parseInt(process.env.JWT_EXP);

    const user = await refreshToken.getUser();
    const newAccessToken = jwt.sign({ uuid: user.id, role: user.role }, process.env.SECRET, { expiresIn });

    const cachedToken = JSON.parse(cache.getItem(`jwt${user.id}`));
    if (cachedToken && cachedToken.isRevoked && cachedToken.isRevoked === true) {
      return res.status(403).json({ message: 'Le refresh token est révoqué' });
    }

    cache.setItem(`jwt${user.id}`, JSON.stringify({ accessToken: newAccessToken, refreshToken: refreshToken.token, isRevoked: false }));

    return res.json({
      userId: user.id,
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
      role: user.role,
    });
  } catch (e) {
    errorHandler(e, res);
  }
};
