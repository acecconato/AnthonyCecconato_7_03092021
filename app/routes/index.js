const express = require('express');
const slowDown = require('express-slow-down');

const router = express.Router();

const usersRoutes = require('./users.routes');
const postsRoutes = require('./posts.routes');
const gdprRoutes = require('./gdpr.routes');
const authRoutes = require('./auth.routes');
const commentsRoutes = require('./comments.routes');

const { authMiddleware: auth } = require('../middlewares');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15mns
  delayAfter: 1000,
  delayMs: 500, // 500ms
});

router.use(speedLimiter);

router.use('/users', auth.isLoggedIn, auth.hasRole('user'), usersRoutes);
router.use('/posts', auth.isLoggedIn, auth.hasRole('user'), postsRoutes);
router.use('/gdpr', auth.isLoggedIn, auth.hasRole('user'), gdprRoutes);
router.use('/auth', authRoutes);
router.use('/comments', auth.isLoggedIn, auth.hasRole('user'), commentsRoutes);

module.exports = router;
