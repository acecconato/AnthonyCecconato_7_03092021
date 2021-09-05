const express = require('express');

const router = express.Router();

const commentsController = require('../controllers/comments.controller');

router.post('/:uuid/reports', commentsController.reportComment);

router.get('/', commentsController.getAllComments);
router.get('/:uuid', commentsController.getCommentByUUID);

router.put('/:uuid', commentsController.updateComment);

router.delete('/:uuid', commentsController.deleteComment);

module.exports = router;
