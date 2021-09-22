const hateoas = require('halson');
const { validate: isUUID } = require('uuid');
const { Sequelize, Op } = require('sequelize');

const { Users, Feeds } = require('../models');
const { getPagination, getPagingData } = require('../services/paginator');
const errorHandler = require('../services/errorHandler');
const { revokeAccess } = require('../middlewares/authenticate.middleware');

/**
 * Get all users
 * Accept ?page= query parameter
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.getAllUsers = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  try {
    const datas = await Users.findAndCountAll({
      offset,
      limit,
      attributes: ['id', 'email', 'username', 'role'],
      order: [['createdAt', 'DESC']],
    });

    const users = datas.rows.map((user) => hateoas(user.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/report` })
      .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('update-password', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/update-password` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/users/${user.id}` }));

    const paginatedUsers = getPagingData(datas, users, req.baseUrl, page, limit);

    return res.json(paginatedUsers);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get user by id
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getUserById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const user = await Users.findOne({ where: { id }, attributes: { exclude: ['password'] } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const result = hateoas(user.dataValues)
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/report` })
      .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('update-password', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/update-password` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/users/${user.id}` });

    res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get user by username
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getUsersByName = async (req, res) => {
  const { username } = req.params;

  try {
    const users = await Users.findAll({
      where: {
        username: { [Op.like]: `%${username}%` },
      },
      attributes: { exclude: ['password'] },
    });

    return res.json(users);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const result = hateoas(user.dataValues)
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/report` })
      .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('update-password', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/update-password` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/users/${user.id}` });

    res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Delete a user
 * The user need to be the owner of the account or an admin to delete his/an account
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const user = await Users.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
    }

    await user.destroy();
    revokeAccess(user).catch((e) => res.status(500).json({ message: e.message }));

    res.status(204).send();
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Update a user
 * You can specify only the attributes you want to update.
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.updateUser = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  const { email, username, role } = req.body || undefined;

  try {
    const user = await Users.findOne({
      where: { id },
      attributes: ['id', 'email', 'username', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    const datas = await user.save();

    const updatedUser = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/report` })
      .addLink('update', { method: 'PUT', href: `${process.env.apiBaseDir}/users/${user.id}` })
      .addLink('update-password', { method: 'POST', href: `${process.env.apiBaseDir}/users/${user.id}/update-password` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/users/${user.id}` });

    return res.json(updatedUser);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Update a user password
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.updateUserPassword = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  const { old_password: oldPassword, new_password: newPassword } = req.body || undefined;

  try {
    const user = await Users.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
    }

    // An admin can change a password without knowing the old one
    if (req.user.role !== 'admin') {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'You need to specify the old_password and the new_password parameters' });
      }

      if (!await user.comparePassword(oldPassword) && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'L\'ancien et le nouveau mot de passe ne peuvent pas être identiques' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'The password has been updated' });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get user feed (posts)
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getUserFeed = async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const feed = await Feeds.findOne({ where: { userId: id } });

    if (!feed) {
      return res.status(404).json('User not found');
    }

    const count = await feed.countPosts();
    const posts = await feed.getPosts({ limit, offset });

    const paginatedFeedPosts = getPagingData({ count }, posts, req.baseUrl, page, limit);

    return res.json(paginatedFeedPosts);
  } catch (e) {
    errorHandler(e, res);
  }
};
