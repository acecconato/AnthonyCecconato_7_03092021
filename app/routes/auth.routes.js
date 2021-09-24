const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const log = require('simple-node-logger').createSimpleLogger(path.join(__dirname, '../../var/logs/auth_limit_reached.log'));

const router = express.Router();

const authController = require('../controllers/auth.controller');
const { isLoggedIn, hasRole } = require('../middlewares/authenticate.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  onLimitReached: (req, res, options) => {
    log.warn({
      message: 'Authentification rate limit reached',
      request: { email: req.body.username },
      ip: req.connection.remoteAddress,
    });
  },
});

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', isLoggedIn, hasRole('user'), authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
