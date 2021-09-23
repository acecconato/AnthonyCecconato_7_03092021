const hateoas = require('halson');
const { validate: isUUID } = require('uuid');
const { Sequelize, Op } = require('sequelize');

const { getPagination, getPagingData } = require('../services/paginator');
const errorHandler = require('../services/errorHandler');
const {
  Posts, Comments, CommentsReports, Users,
} = require('../models');

/**
 * Get all comments
 * Accept ?page= query parameter
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getAllComments = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  try {
    const datas = await Comments.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    const comments = datas.rows.map((comment) => hateoas(comment.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/comments/${comment.id}` }));

    const paginatedComments = getPagingData(datas, comments, req.baseUrl, page, limit);

    return res.json(paginatedComments);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get all reported comments
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getReportedComments = async (req, res) => {
  try {
    const comments = await Comments.findAll({
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('reports.id')), 'nbReports']],
      },
      include: [
        { model: CommentsReports, as: 'reports', attributes: [] },
        { model: Users, as: 'user', attributes: ['username'] },
      ],
      order: [
        [Sequelize.literal('nbReports'), 'DESC'],
      ],
      group: ['id'],
      having: Sequelize.where(Sequelize.literal('nbReports'), '>', 0),
    });

    return res.json(comments);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get a comment by id
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getCommentById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const comment = await Comments.findOne({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    const result = hateoas(comment.dataValues)
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/comments/${comment.id}` });

    return res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Add a comment
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.addComment = async (req, res) => {
  try {
    const post = await Posts.findOne({ where: { id: req.body.postId } });

    if (!post) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const comment = await post.createComment({ content: req.body.content, userId: req.user.id });
    comment.setDataValue('user', await comment.getUser());

    const result = hateoas(comment.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/comments/${comment.id}` });

    return res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Update a comment
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.updateComment = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  const { content } = req.body || undefined;

  try {
    const comment = await Comments.findOne({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    // Must be the owner or an admin
    if (req.user.id !== comment.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    comment.content = content || comment.content;

    const datas = await comment.save();

    const updatedComment = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/comments/${comment.id}` });

    return res.json(updatedComment);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Delete a comment
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.deleteComment = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const comment = await Comments.findOne({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    // Must be the owner or an admin
    if (req.user.id !== comment.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    await comment.destroy();

    res.status(204).send();
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Report a comment
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.reportComment = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const comment = await Comments.findOne({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    const isAlreadyReported = await CommentsReports.count({ where: { userId: req.user.id, commentId: id } });
    if (isAlreadyReported) {
      return res.status(409).json({ message: 'Vous avez déjà signalé ce commentaire' });
    }

    const report = await comment.createReport({ userId: req.user.id, commentId: id });
    return res.status(201).json(report);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get reports related to a comment
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getCommentReports = async (req, res, next) => {
  const { id } = req.params;
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const comment = await Comments.findOne({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    const datas = await CommentsReports.findAndCountAll({
      where: { commentId: comment.id },
      offset,
      limit,
    });

    const result = getPagingData(datas, datas.rows, req.baseUrl, page, limit);

    return res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Delete reports related to a comment
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.deleteCommentReports = async (req, res) => {
  try {
    const reports = await CommentsReports.findAll({
      attributes: ['id'],
      where: { commentId: req.params.id },
    });

    await CommentsReports.destroy({
      where: { id: { [Op.in]: reports.map((report) => report.id) } },
    });

    return res.status(204).send();
  } catch (e) {
    errorHandler(e, res);
  }
};
