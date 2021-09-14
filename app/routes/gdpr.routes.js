const express = require('express');

const router = express.Router();

const gdprController = require('../controllers/gdpr.controller');

router.get('/export-my-data', gdprController.exportMyData);

module.exports = router;
