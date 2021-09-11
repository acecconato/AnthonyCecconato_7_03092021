const hateoas = require('halson');
const { validate: isUUID } = require('uuid');

const errorHandler = require('../services/errorHandler');
const {
  Posts, Comments, CommentsReports,
} = require('../models');

/**
 * Get all comments
 * Accept ?page= query parameter
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getAllComments = async (req, res, next) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(process.env.ITEMS_PER_PAGE);
  const offset = (page * limit);

  try {
    const datas = await Comments.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    const comments = datas.rows.map((post) => hateoas(post.dataValues));
    // .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
    // .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
    // .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` })
    // .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/votes` })
    // .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
    // .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
    // .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` }));

    const totalPage = (datas.count / limit);
    let previousPage;

    if (page > 0 && (page) < totalPage + 1) {
      previousPage = page - 1;
    }

    if (page > 0 && (page) >= totalPage + 1) {
      return next();
    }

    const nextPage = ((page + 1) <= totalPage) ? page + 1 : undefined;

    const metadata = hateoas({
      total: datas.count, limit, offset, currentPage: page,
    });

    if (previousPage !== undefined) {
      metadata.addLink('previous', { method: 'GET', href: `${process.env.apiBaseDir}/posts?page=${previousPage}` });
    }

    if (nextPage) {
      metadata.addLink('next', { method: 'GET', href: `${process.env.apiBaseDir}/posts?page=${nextPage}` });
    }

    return res.json({ metadata, comments });
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
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
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
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await post.createComment({ content: req.body.content, userId: req.user.id });

    return res.json(comment);
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
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== comment.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
    }

    comment.content = content || comment.content;

    const datas = await comment.save();

    const updatedComment = hateoas(datas.dataValues);

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
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== comment.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
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
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAlreadyReported = await CommentsReports.count({ where: { userId: req.user.id, commentId: id } });
    if (isAlreadyReported) {
      return res.json({ message: 'You have already reported this comment' });
    }

    const report = await comment.createReport({ userId: req.user.id, commentId: id });
    return res.status(201).json(report);
  } catch (e) {
    errorHandler(e, res);
  }
};
