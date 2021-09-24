const express = require('express');

const router = express.Router();

const commentsController = require('../controllers/comments.controller');
const { hasRole } = require('../middlewares/authenticate.middleware');

router.post('/', commentsController.addComment);
router.post('/:id/reports', commentsController.reportComment);

router.get('/', commentsController.getAllComments);
router.get('/reports', hasRole('admin'), commentsController.getReportedComments);
router.get('/:id', commentsController.getCommentById);
router.get('/:id/reports', hasRole('admin'), commentsController.getCommentReports);

router.patch('/:id', commentsController.updateComment);

router.delete('/:id', commentsController.deleteComment);
router.delete('/:id/reports', hasRole('admin'), commentsController.deleteCommentReports);

module.exports = router;
