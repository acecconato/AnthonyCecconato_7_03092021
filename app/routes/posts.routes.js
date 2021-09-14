const express = require('express');

const router = express.Router();

const postsController = require('../controllers/posts.controller');

const { hasRole } = require('../middlewares/authenticate.middleware');

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.get('/:id/votes', postsController.getPostVotes);
router.get('/:id/comments', postsController.getPostComments);
router.get('/:id/reports', hasRole('admin'), postsController.getPostReports);

router.post('/', postsController.publish);
router.post('/:id/share', postsController.sharePost);
router.post('/:id/votes', postsController.handleVote);
router.post('/:id/reports', postsController.reportPost);

router.patch('/:id', postsController.updatePost);

router.delete('/:id', postsController.deletePost);
router.delete('/:id/share', postsController.unsharePost);

module.exports = router;
