const jwt = require('jsonwebtoken');

const cache = require('../services/cache');

const { TokenExpiredError } = jwt;

/**
 * Is user logged in?
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
const isLoggedIn = (req, res, next) => {
  if (!req.token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: 'The access token is expired' });
      }

      return res.status(401).send({ message: 'The access token is not valid' });
    }

    // Json web token revoke system
    const cachedToken = JSON.parse(cache.getItem(`jwt${decoded.uuid}`)) || undefined;
    if (cachedToken) {
      if (!cachedToken.accessToken || cachedToken.accessToken !== req.token) {
        return res.status(403).json({ message: 'The cached token and the current token doesn\'t matches, please login again' });
      }

      if (cachedToken.isRevoked) {
        return res.status(403).json({ message: 'The access token is revoked' });
      }
    }

    req.user = {
      id: decoded.uuid,
      role: decoded.role,
    };

    next();
  });
};

/**
 * Check if the user have the proper rights by verifying his role
 * @param role
 * @return {function(*, *, *): Promise<*|undefined>}
 */
const hasRole = (role) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(500).json({ message: 'Something went wrong when trying to retrieve the user from the request' });
    }

    const roleHierarchy = { admin: 'user', user: 'user' };

    if (req.user.role === role || roleHierarchy[req.user.role] === role) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient rights' });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};

/**
 * Revoke user access
 * @param user
 * @return {Promise<void>}
 */
const revokeAccess = async (user) => {
  if (user && user.id && user.role) {
    const cachedToken = JSON.parse(cache.getItem(`jwt${user.id}`)) || undefined;
    if (cachedToken && cachedToken.accessToken && cachedToken.refreshToken) {
      cache.setItem(`jwt${user.id}`, JSON.stringify({ ...JSON.parse(cache.getItem(`jwt${user.id}`)), isRevoked: true }));
    }
  }
};

module.exports = {
  isLoggedIn,
  hasRole,
  revokeAccess,
};
