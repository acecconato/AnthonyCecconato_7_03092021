const express = require('express');

const router = express.Router();

const commentsController = require('../controllers/comments.controller');

router.post('/comments', commentsController.addComment);
router.post('/:id/reports', commentsController.reportComment);

router.get('/', commentsController.getAllComments);
router.get('/:id', commentsController.getCommentById);

router.put('/:id', commentsController.updateComment);

router.delete('/:id', commentsController.deleteComment);

module.exports = router;
