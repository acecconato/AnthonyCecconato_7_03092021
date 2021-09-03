const express = require('express');
const slowDown = require('express-slow-down');

const router = express.Router();

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15mns
  delayAfter: 1000,
  delayMs: 500, // 500ms
});

// router.use(...)

module.exports = router;
