const express = require('express');
const slowDown = require('express-slow-down');

const router = express.Router();

const usersRoutes = require('./users.routes');
const postsRoutes = require('./posts.routes');
const attachmentsRoutes = require('./attachments.routes');
const gdprRoutes = require('./gdpr.routes');
const authRoutes = require('./auth.routes');
const commentsRoutes = require('./comments.routes');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15mns
  delayAfter: 1000,
  delayMs: 500, // 500ms
});

router.use(speedLimiter);

router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
router.use('/attachments', attachmentsRoutes);
router.use('/gdpr', gdprRoutes);
router.use('/auth', authRoutes);
router.use('/comments', commentsRoutes);

module.exports = router;
