const express = require('express');

const router = express.Router();

const { authMiddleware: auth } = require('../middlewares');

const usersController = require('../controllers/users.controller');

router.get('/', auth.isLoggedIn, auth.hasRole('user'), usersController.getAllUsers);
router.get('/:uuid', auth.hasRole('user'), usersController.getUserByUUID);

router.delete('/:uuid', usersController.deleteUser);

router.put('/:uuid', usersController.updateUser);
router.put('/:uuid/update-password', usersController.updateUserPassword);

router.post('/:uuid/reports', usersController.reportUser);

module.exports = router;
