const hateoas = require('halson');
const { validate: isUUID } = require('uuid');
const Sequelize = require('sequelize');

const { getPagination, getPagingData } = require('../services/paginator');
const errorHandler = require('../services/errorHandler');
const {
  Posts, Users, Comments, Likes, PostsReports, Feeds,
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

    const datas = await user.createPost(req.body, { fields: ['content', 'media'] });
    const feed = await user.getFeed();
    await feed.addPost(datas);

    datas.setDataValue('commentsCount', 0);
    datas.setDataValue('user', user);
    datas.setDataValue('likes', []);

    const post = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}` })
      .addLink('get likes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${datas.id}/likes` })
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
      offset,
      limit,
      include: [
        { model: Comments, as: 'comments', attributes: ['id'] },
        { model: Likes, as: 'likes', attributes: ['userId'] },
        { model: Users, as: 'user', attributes: ['username'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const posts = datas.map((post) => {
      post.setDataValue('commentsCount', post.comments.length);
      post.setDataValue('comments', undefined);

      return hateoas(post.dataValues)
        .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
        .addLink('get likes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/likes` })
        .addLink('get comments', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/comments` })
        .addLink('get reports', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
        .addLink('report', { method: 'POST', href: `${process.env.apiBaseDir}/posts/${post.id}/reports` })
        .addLink('update', { method: 'PATCH', href: `${process.env.apiBaseDir}/posts/${post.id}` })
        .addLink('delete', { method: 'DELETE', href: `${process.env.apiBaseDir}/posts/${post.id}` });
    });

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
          'likes',
        ],
      },
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = hateoas(post.dataValues)
      .addLink('get likes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/likes` })
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

  const { content, media } = req.body || undefined;

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
    post.media = media || post.media;

    const datas = await post.save();

    const updatedPost = hateoas(datas.dataValues)
      .addLink('self', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}` })
      .addLink('get likes', { method: 'GET', href: `${process.env.apiBaseDir}/posts/${post.id}/likes` })
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
 * Get likes related to a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.getPostLikes = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id }, include: ['likes'] });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.json(post.likes);
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
 * Like a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.handleLike = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const like = await Likes.findOne({ where: { userId: req.user.id, postId: id } });

    if (!like) {
      const newLike = await post.createLike({ userId: req.user.id });
      return res.status(201).json(newLike);
    }

    return res.status(409).json({ message: 'You already liked this post' });
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

/**
 * Share a post the user's feed
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.sharePost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const feed = await Feeds.findOne({ where: { userId: req.user.id } });

    if (await feed.hasPost(post)) {
      return res.status(409).json({ message: 'You already have this post in your feed' });
    }

    await feed.setPost(post);

    return res.json({ message: 'Post has been shared in your feed' });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Unshare a post from the user's feed
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.unsharePost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId === req.user.id) {
      return res.status(403).json({ message: 'You can\'t unshare your own post' });
    }

    const feed = await Feeds.findOne({ where: { userId: req.user.id } });

    if (!await feed.hasPost(post)) {
      return res.status(409).json({ message: 'The post is not inside the feed' });
    }

    await feed.removePost(post);

    return res.json({ message: 'Post has been unshared from your feed' });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Unlike a post
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.unlikePost = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !isUUID(id)) {
    return next();
  }

  try {
    const post = await Posts.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const like = await Likes.findOne({ where: { userId: req.user.id, postId: id } });

    if (!like) {
      return res.status(404).json({ message: 'Can\'t unlike something not liked' });
    }

    await like.destroy();

    return res.json({ message: 'The post has been unliked' });
  } catch (e) {
    errorHandler(e, res);
  }
};
