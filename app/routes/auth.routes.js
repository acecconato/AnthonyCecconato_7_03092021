const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');
const { isLoggedIn, hasRole } = require('../middlewares/authenticate.middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', isLoggedIn, hasRole('user'), authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
