const hateoas = require('halson');
const { validate: isUUID } = require('uuid');

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
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` });

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
exports.getAllPosts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(process.env.ITEMS_PER_PAGE);
  const offset = (page * limit);

  try {
    const datas = await Posts.findAndCountAll({
      offset,
      limit,
      include: [
        { model: Comments, as: 'comments', attributes: ['id'] },
        { model: Users, as: 'user', attributes: ['username'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const posts = datas.rows.map((post) => hateoas(post.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` }));

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

    return res.json({ metadata, posts });
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

    res.json(post);
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

    post.content = content || post.username;

    const datas = await post.save();

    const updatedPost = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('get votes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/votes` })
      .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/comments` })
      .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` })
      .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${datas.id}/reports` });

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

    return res.json(post.comments);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Downvote, cancel a vote or upvote a post (-1, 0, 1)
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

exports.getPostReports = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reports = await post.getReports();
    return res.json([{ total: Object.keys(reports).length, reports }]);
  } catch (e) {
    errorHandler(e, res);
  }
};
