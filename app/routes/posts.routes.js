const express = require('express');

const router = express.Router();

const postsController = require('../controllers/posts.controller');

router.post('/', postsController.publish);
router.post('/:id/votes', postsController.handleVote);
router.post('/:id/reports', postsController.reportPost);

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.get('/:id/votes', postsController.getPostVotes);
router.get('/:id/comments', postsController.getPostComments);
router.get('/:id/reports', postsController.getPostReports);

router.delete('/:id', postsController.deletePost);

router.patch('/:id', postsController.updatePost);

module.exports = router;
