const express = require('express');

const router = express.Router();

const postsController = require('../controllers/posts.controller');

router.post('/', postsController.publish);
router.post('/:uuid/votes', postsController.handleVote);
router.post('/:uuid/reports', postsController.reportPost);

router.get('/', postsController.getAllPosts);
router.get('/uuid', postsController.getPostByUUID);
router.get('/:uuid/votes', postsController.getPostVotes);
router.get('/:uuid/comments', postsController.getPostComments);
router.get('/:uuid/reports', postsController.getPostReports);

router.delete('/:uuid', postsController.deletePost);

router.put('/:uuid', postsController.updatePost);

module.exports = router;
