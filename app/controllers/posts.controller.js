const hateoas = require('halson');
const { validate: isUUID } = require('uuid');
const Sequelize = require('sequelize');

const { getPagination, getPagingData } = require('../services/paginator');
const errorHandler = require('../services/errorHandler');
const {
  Posts, Users, Comments, Votes, PostsReports,
} = require('../models');

/**
 * Create a new post
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.publish = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const datas = await user.createPost(req.body, { fields: ['content'] });

    const post = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${datas.id}` });

    return res.status(201).json(post);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get all posts
 * Accept ?page= query parameter
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getAllPosts = async (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  try {
    const count = await Posts.count();

    const datas = await Posts.findAll({
      subQuery: false,
      offset,
      limit,
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('comments.id')), 'commentsCount'],
        ],
      },
      include: [
        { model: Comments, as: 'comments', attributes: [] },
        { model: Votes, as: 'votes', attributes: ['vote'] },
        { model: Users, as: 'user', attributes: ['username'] },
      ],
      order: [['createdAt', 'DESC']],
      group: ['id'],
    });

    const posts = datas.map((post) => hateoas(post.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` }));

    const paginatedPosts = getPagingData({ count }, posts, req.baseUrl, page, limit);

    return res.json(paginatedPosts);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get a post by id
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getPostById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne(
      {
        where: { id },
        include: [
          { model: Users, as: 'user', attributes: { exclude: 'password' } },
          'comments',
          'votes',
        ],
      },
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = hateoas(post.dataValues)
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` });

    res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Delete a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.deletePost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== post.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
    }

    await post.destroy();

    res.status(204).send();
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Update a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.updatePost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  const { content } = req.body || undefined;

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Must be the owner or an admin
    if (req.user.id !== post.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient rights' });
    }

    post.content = content || post.content;

    const datas = await post.save();

    const updatedPost = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` });

    return res.json(updatedPost);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get votes related to a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getPostVotes = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id }, include: ['votes'] });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.json(post.votes);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get comments related to a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getPostComments = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id }, include: ['comments'] });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = post.comments.map((comment) => hateoas(comment.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}` })
      .addLink('get comment reports', { method: 'GET', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/comments/${comment.id}/reports` }));

    return res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Vote for a post (-1, 0, 1)
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.handleVote = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  if (typeof req.body.vote === 'number') {
    return res.status(422).json({ message: 'The vote value must be a string' });
  }

  if (!req.body.vote || req.body.vote != '-1' || req.body.vote > 1) {
    return res.status(422).json({ message: 'The vote value must be -1, 0 or 1' });
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const vote = await Votes.findOne({ where: { userId: req.user.id, postId: id } });

    if (!vote) {
      const newVote = await post.createVote({ userId: req.user.id, vote: req.body.vote });
      return res.status(201).json(newVote);
    }

    vote.vote = req.body.vote;
    const updatedVote = await vote.save();

    return res.json(updatedVote);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Report a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.reportPost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isAlreadyReported = await PostsReports.count({ where: { userId: req.user.id, postId: id } });
    if (isAlreadyReported) {
      return res.json({ message: 'You have already reported this post' });
    }

    const report = await post.createReport({ userId: req.user.id, postId: id });
    return res.status(201).json(report);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get reports related to a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getPostReports = async (req, res, next) => {
  const { id } = req.params;
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const datas = await PostsReports.findAndCountAll({
      where: { postId: post.id },
      offset,
      limit,
    });

    const result = getPagingData(datas, datas.rows, req.baseUrl, page, limit);

    return res.json(result);
  } catch (e) {
    errorHandler(e, res);
  }
};
