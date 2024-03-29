const hateoas = require('halson');
const { validate: isUUID } = require('uuid');
const { Op, Sequelize } = require('sequelize');

const { getPagination, getPagingData } = require('../services/paginator');
const errorHandler = require('../services/errorHandler');
const {
  Posts, Users, Comments, Likes, PostsReports, Feeds, Posts_Feeds,
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
      return res.status(404).json({ message: 'Utilisateur introuvable' });
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
 * Accept ?page= and ?size= query parameter
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
        { model: Feeds, as: 'feeds' },
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
 * Get all posts related to a user feed
 * Accept ?page= and ?size= query parameter
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getPostsFeed = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(422).json({ message: 'Le nom d\'utilisateur est requis' });
  }

  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  try {
    const user = await Users.findOne({ where: { username: { [Op.like]: username } }, include: ['feed'] });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const feed = await user.getFeed();

    if (!feed) {
      console.error('Unable to get the user feed');
      return res.status(500).send();
    }

    const count = await feed.countPosts();

    const postsIds = await Posts_Feeds.findAll({
      where: { feedId: feed.id },
      attributes: ['postId'],
    });

    const ids = [];
    postsIds.forEach((post) => {
      ids.push(post.postId);
    });

    const datas = await feed.getPosts({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      include: [
        { model: Comments, as: 'comments', attributes: ['id'] },
        { model: Likes, as: 'likes', attributes: ['userId'] },
        { model: Users, as: 'user', attributes: ['username'] },
        { model: Feeds, as: 'feeds' },
        { model: Posts_Feeds, as: 'Posts_Feeds' },
      ],
      order: [
        [Sequelize.col('Posts_Feeds.createdAt'), 'DESC'],
      ],
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
          { model: Feeds, as: 'feeds', attributes: ['userId'] },
          'comments',
          'likes',
        ],
      },
    );

    if (!post) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    post.setDataValue('commentsCount', post.comments.length || 0);

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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    // Must be the owner or an admin
    if (req.user.id !== post.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    // Must be the owner or an admin
    if (req.user.id !== post.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
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
    const comments = await Comments.findAll({
      where: { postId: id },
      include: ['user'],
      order: [['createdAt', 'ASC']],
    });

    if (!comments) {
      return res.status(404).json({ message: 'Commentaires introuvables' });
    }

    const result = comments.map((comment) => hateoas(comment.dataValues)
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const like = await Likes.findOne({ where: { userId: req.user.id, postId: id } });

    if (!like) {
      const newLike = await post.createLike({ userId: req.user.id });
      return res.status(201).json(newLike);
    }

    return res.status(409).json({ message: 'Vous avez déjà aimé cette publication' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const isAlreadyReported = await PostsReports.count({ where: { userId: req.user.id, postId: id } });
    if (isAlreadyReported) {
      return res.status(409).json({ message: 'Vous avez déjà signalé cette publication' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const feed = await Feeds.findOne({ where: { userId: req.user.id } });

    if (await feed.hasPost(post)) {
      return res.status(409).json({ message: 'Vous avez déjà partagé cette publication' });
    }

    await feed.addPost(post);

    return res.json({ message: 'La publication a bien été partagée' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    if (post.userId === req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez pas ne plus partager votre publication' });
    }

    const feed = await Feeds.findOne({ where: { userId: req.user.id } });

    if (!await feed.hasPost(post)) {
      return res.status(409).json({ message: 'La publication n\'est pas dans le fil d\'actualité' });
    }

    await feed.removePost(post);

    return res.json({ message: 'La publication a bien été enlevé de votre fil d\'actualité' });
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
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const like = await Likes.findOne({ where: { userId: req.user.id, postId: id } });

    if (!like) {
      return res.status(404).json({ message: 'Vous n\'avez pas aimé la publication' });
    }

    await like.destroy();

    return res.json({ message: 'Vous avez enlevé votre j\'aime de la publication' });
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Get reported posts
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getReportedPosts = async (req, res) => {
  try {
    const datas = await Posts.findAll({
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('reports.id')), 'nbReports'],
        ],
      },
      include: [
        { model: Users, as: 'user', attributes: ['username'] },
        { model: PostsReports, as: 'reports', attributes: [] },
      ],
      order: [
        [Sequelize.literal('nbReports'), 'DESC'],
      ],
      group: ['id'],
      having: Sequelize.where(Sequelize.literal('nbReports'), '>', 0),
    });

    return res.json(datas);
  } catch (e) {
    errorHandler(e, res);
  }
};

/**
 * Delete reports related to a post
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.deletePostReports = async (req, res) => {
  try {
    const reports = await PostsReports.findAll({
      attributes: ['id'],
      where: { postId: req.params.id },
    });

    await PostsReports.destroy({
      where: { id: { [Op.in]: reports.map((report) => report.id) } },
    });

    return res.status(204).send();
  } catch (e) {
    errorHandler(e, res);
  }
};
