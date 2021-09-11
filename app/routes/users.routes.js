const express = require('express');

const router = express.Router();

const { authMiddleware: auth } = require('../middlewares');

const usersController = require('../controllers/users.controller');

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

router.delete('/:id', usersController.deleteUser);

router.patch('/:id', auth.hasRole('admin'), usersController.updateUser);

router.post('/:id/update-password', usersController.updateUserPassword);

module.exports = router;
