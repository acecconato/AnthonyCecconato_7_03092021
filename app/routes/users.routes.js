const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');

const usersController = require('../controllers/users.controller');

router.get('/', verifyToken, usersController.getAllUsers);
router.get('/:uuid', usersController.getUserByUUID);

router.delete('/:uuid', usersController.deleteUser);

router.put('/:uuid', usersController.updateUser);
router.put('/:uuid/update-password', usersController.updateUserPassword);

router.post('/:uuid/reports', usersController.reportUser);

module.exports = router;
